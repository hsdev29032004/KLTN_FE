'use client';

import { useEffect, useState, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingCart, Loader2, ArrowRight, LogIn, CreditCard, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useCartStore } from '@/stores/cart/cart-store';
import { useAuthStore } from '@/stores/auth/auth-store';
import { useCourseStore } from '@/stores/course/course-store';
import { BankSelectionDialog } from '@/components/payment/bank-selection-dialog';
import { useBankStore } from '@/stores/bank/bank-store';
import { formatMoney } from '@/helpers/format.helper';
import type { CartItem } from '@/types/cart.type';
import type { CourseListItem } from '@/types/course.type';

// Checkout step type
type CheckoutStep = 'login' | 'payment';

function CheckoutStepper({ currentStep, isLoggedIn }: { currentStep: CheckoutStep; isLoggedIn: boolean }) {
  const steps: { key: CheckoutStep; label: string; icon: React.ReactNode }[] = [
    { key: 'login', label: 'Đăng nhập', icon: <LogIn className="h-4 w-4" /> },
    { key: 'payment', label: 'Thanh toán', icon: <CreditCard className="h-4 w-4" /> },
  ];

  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center gap-2 w-full mb-5">
      {steps.map((step, index) => {
        const isCompleted = isLoggedIn && step.key === 'login';
        const isActive = step.key === currentStep;

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 transition-colors ${isCompleted
                  ? 'bg-primary border-primary text-primary-foreground'
                  : isActive
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.icon}
              </div>
              <span
                className={`text-sm font-medium truncate ${isCompleted || isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-8 mx-2 shrink-0 transition-colors ${isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function InlineLoginForm({ onLoginSuccess, disabled }: { onLoginSuccess: () => void; disabled?: boolean }) {
  const authStore = useAuthStore();
  const cartStore = useCartStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data } = await authStore.login(email, password);
      if (data?.user?.role?.name === 'User') {
        await cartStore.syncLocalCartToServer();
      }
      onLoginSuccess();
    } catch {
      setError('Email hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cart-email">Email</Label>
        <Input
          id="cart-email"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cart-password">Mật khẩu</Label>
        <Input
          id="cart-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={disabled}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full gap-2" disabled={isLoading || disabled}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang đăng nhập...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </>
        )}
      </Button>
    </form>
  );
}

export default function CartPage() {
  const router = useRouter();
  const cartStore = useCartStore();
  const authStore = useAuthStore();
  const courseStore = useCourseStore();

  const user = authStore.user;
  const isLoggedIn = !!user;
  const isTrainee = user?.role?.name === 'User';

  // For unauthenticated: fetch course details from localStorage IDs
  const [localCourses, setLocalCourses] = useState<CourseListItem[]>([]);
  const [localLoading, setLocalLoading] = useState(false);

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // Checkout step state for guest users
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(isLoggedIn ? 'payment' : 'login');

  // Update step when login state changes
  useEffect(() => {
    if (isLoggedIn) {
      setCheckoutStep('payment');
    }
  }, [isLoggedIn]);

  // Load cart data
  useEffect(() => {
    if (isLoggedIn && isTrainee) {
      cartStore.fetchCart();
    } else {
      // Guest or non-trainee: read localStorage directly and fetch course details
      cartStore.initLocalCart();

      let ids: string[] = [];
      try {
        ids = JSON.parse(localStorage.getItem('onlearn_cart') || '[]');
      } catch {
        ids = [];
      }

      if (ids.length > 0) {
        setLocalLoading(true);
        courseStore.fetchCourses(ids).then((res: any) => {
          const data: CourseListItem[] = res ?? [];
          const courses = Array.isArray(data) ? data : [];

          setLocalCourses(courses);
          setCheckedIds(new Set(courses.map(c => c.id)));
        }).catch(() => {
          setLocalCourses([]);
        }).finally(() => setLocalLoading(false));
      }
    }
  }, []);

  // For logged-in trainee, auto-check all items when cart loads
  useEffect(() => {
    if (isLoggedIn && isTrainee && cartStore.items && cartStore.items.length > 0) {
      setCheckedIds(new Set(cartStore.items.map(item => item.courseId)));
    }
  }, []);

  const toggleCheck = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRemove = async (courseId: string) => {
    if (isLoggedIn && isTrainee) {
      await cartStore.removeFromCart([courseId]);
    } else {
      cartStore.removeFromLocalCart(courseId);
      setLocalCourses(prev => prev.filter(c => c.id !== courseId));
    }
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.delete(courseId);
      return next;
    });
  };

  const handleLoginSuccess = useCallback(async () => {
    // After login, refetch cart from server (syncLocalCartToServer already called in InlineLoginForm)
    await cartStore.fetchCart();
    setCheckoutStep('payment');
  }, [cartStore]);

  const handlePurchase = async () => {
    const selectedIds = Array.from(checkedIds);
    if (selectedIds.length === 0) return;

    if (!isLoggedIn) {
      // Should not happen with new UI, but just in case
      setCheckoutStep('login');
      return;
    }
    // Open bank selection dialog before calling purchase API
    setBankDialogOpen(true);
  };

  // Bank selection for cart checkout
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const bankStore = useBankStore();
  const banks = bankStore.list ?? [];
  const banksLoading = bankStore.loading;

  // Fetch banks when dialog opens (lazy)
  useEffect(() => {
    if (bankDialogOpen && (!banks || banks.length === 0)) {
      bankStore.fetchBanks();
    }
  }, [bankDialogOpen]);

  const handleBankSelected = async (bankId: string) => {
    setBankDialogOpen(false);
    try {
      const selectedIds = Array.from(checkedIds);
      const res: any = await cartStore.purchaseCourses(selectedIds);
      const paymentUrl = res?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      }
    } catch (e) {
      console.error('purchase error', e);
    }
  };

  const loading = (isLoggedIn && isTrainee) ? cartStore.loading : localLoading;

  // Build display items
  const displayItems: Array<{ id: string; courseId: string; name: string; thumbnail: string; price: number; instructorName: string; instructorAvatar: string; star: string | number }> =
    (isLoggedIn && isTrainee)
      ? (cartStore.items || []).map((item: CartItem) => ({
        id: item.id,
        courseId: item.courseId,
        name: item.course.name,
        thumbnail: item.course.thumbnail,
        price: item.course.price,
        instructorName: item.course.user.fullName,
        instructorAvatar: item.course.user.avatar,
        star: item.course.star,
      }))
      : localCourses.map((c: CourseListItem) => ({
        id: c.id,
        courseId: c.id,
        name: c.name,
        thumbnail: c.thumbnail,
        price: c.price,
        instructorName: c.user?.fullName || 'Giảng viên',
        instructorAvatar: c.user?.avatar || '',
        star: c.star,
      }));

  const checkedItems = displayItems.filter(item => checkedIds.has(item.courseId));
  const total = checkedItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShoppingCart className="h-8 w-8" />
            Giỏ hàng
          </h1>
          <p className="text-muted-foreground mt-2">
            {displayItems.length > 0
              ? `${displayItems.length} khóa học trong giỏ hàng`
              : 'Giỏ hàng trống'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : displayItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-4">
                Giỏ hàng trống
              </p>
              <Button onClick={() => router.push('/courses')}>
                Khám phá khóa học
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart items */}
            <div className="flex-1 space-y-3">
              {displayItems.map(item => (
                <Card
                  key={item.id}
                  className={`overflow-hidden cursor-pointer transition-colors ${checkedIds.has(item.courseId) ? 'border-primary' : 'opacity-60'
                    }`}
                  onClick={() => toggleCheck(item.courseId)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-center">
                      <Checkbox
                        checked={checkedIds.has(item.courseId)}
                        onClick={e => e.stopPropagation()}
                        onCheckedChange={() => toggleCheck(item.courseId)}
                      />
                      <div className="relative w-40 h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-clamp-2">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Avatar className="h-6 w-6">
                            {item.instructorAvatar ? (
                              <AvatarImage src={item.instructorAvatar} alt={item.instructorName} />
                            ) : null}
                            <AvatarFallback className="text-xs">
                              {item.instructorName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{item.instructorName}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-lg font-bold">{formatMoney(item.price)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={e => {
                            e.stopPropagation();
                            handleRemove(item.courseId);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order summary + checkout steps */}
            <div className="lg:w-96">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Đã chọn</span>
                    <span>{checkedItems.length} / {displayItems.length} khóa học</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span>{formatMoney(total)}</span>
                  </div>

                  {/* Stepper for guest checkout */}
                  {!isLoggedIn && (
                    <>
                      <Separator />
                      <CheckoutStepper currentStep={checkoutStep} isLoggedIn={isLoggedIn} />
                      {checkoutStep === 'login' && (
                        <InlineLoginForm
                          onLoginSuccess={handleLoginSuccess}
                          disabled={checkedItems.length === 0}
                        />
                      )}
                    </>
                  )}
                </CardContent>

                {/* Show purchase button only when logged in or on payment step */}
                {isLoggedIn && (
                  <CardFooter>
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={handlePurchase}
                      disabled={cartStore.purchasing || checkedItems.length === 0}
                    >
                      {cartStore.purchasing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          Thanh toán
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
      <BankSelectionDialog
        open={bankDialogOpen}
        onOpenChange={(v) => setBankDialogOpen(v)}
        banks={banks}
        loading={banksLoading}
        selectOnly
        onSelectBank={handleBankSelected}
        depositing={cartStore.purchasing}
      />
    </div>
  );
}

