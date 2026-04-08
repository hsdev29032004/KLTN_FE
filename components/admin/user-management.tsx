'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Shield,
  ShieldOff,
  Trash2,
  RotateCcw,
  Loader2,
  CalendarIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import SDK from '@/stores/sdk';
import { toast } from 'sonner';
import type { User, AdminUserListParams } from '@/types/user.type';
import { formatMoney } from '@/helpers/format.helper';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  Admin: {
    label: 'Admin',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
  Teacher: {
    label: 'Giảng viên',
    className: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  User: {
    label: 'Học viên',
    className: 'bg-green-100 text-green-700 border-green-300',
  },
};

const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả vai trò' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Teacher', label: 'Giảng viên' },
  { value: 'User', label: 'Học viên' },
];

const BANNED_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Đang bị cấm' },
  { value: 'false', label: 'Không bị cấm' },
];

const DELETED_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'true', label: 'Đã xóa' },
  { value: 'false', label: 'Chưa xóa' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'fullName', label: 'Họ tên' },
  { value: 'email', label: 'Email' },
  { value: 'availableAmount', label: 'Số dư' },
];

function RoleBadge({ roleName }: { roleName: string }) {
  const cfg = ROLE_BADGE[roleName] ?? {
    label: roleName,
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  };
  return (
    <Badge variant="outline" className={`text-xs ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
}

function BanStatusBadge({ user }: { user: User }) {
  if (user.isDeleted) {
    return (
      <Badge
        variant="outline"
        className="text-xs bg-gray-100 text-gray-500 border-gray-300"
      >
        Đã xóa
      </Badge>
    );
  }
  if (user.banId) {
    return (
      <Badge
        variant="outline"
        className="text-xs bg-red-100 text-red-700 border-red-300"
      >
        Bị cấm
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-xs bg-green-100 text-green-700 border-green-300"
    >
      Hoạt động
    </Badge>
  );
}

function formatDate(date: string) {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });
}

function formatDateShort(date: string) {
  return format(new Date(date), 'dd/MM/yyyy', { locale: vi });
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Ban Dialog ──────────────────────────────────────────────────────────────

function BanDialog({
  open,
  onClose,
  onBan,
  userName,
}: {
  open: boolean;
  onClose: () => void;
  onBan: (reason: string, timeUnBan?: string) => Promise<void>;
  userName: string;
}) {
  const [reason, setReason] = useState('');
  const [isPermanent, setIsPermanent] = useState(true);
  const [timeUnBan, setTimeUnBan] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do cấm');
      return;
    }
    setLoading(true);
    try {
      await onBan(
        reason.trim(),
        isPermanent ? undefined : timeUnBan?.toISOString(),
      );
      setReason('');
      setIsPermanent(true);
      setTimeUnBan(undefined);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cấm người dùng</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Cấm người dùng &quot;{userName}&quot;
        </p>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Lý do cấm</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do cấm..."
              rows={3}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Loại cấm</Label>
            <Select
              value={isPermanent ? 'permanent' : 'temporary'}
              onValueChange={(v) => setIsPermanent(v === 'permanent')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permanent">Vĩnh viễn</SelectItem>
                <SelectItem value="temporary">Tạm thời</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!isPermanent && (
            <div className="grid gap-1.5">
              <Label>Thời gian hết cấm</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !timeUnBan && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {timeUnBan
                      ? format(timeUnBan, 'dd/MM/yyyy', { locale: vi })
                      : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={timeUnBan}
                    onSelect={setTimeUnBan}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading}
          >
            <Shield className="mr-1 h-4 w-4" />
            {loading ? 'Đang xử lý...' : 'Cấm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── User Detail Drawer ──────────────────────────────────────────────────────

function UserDetailDrawer({
  open,
  onClose,
  userId,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onRefresh: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    introduce: '',
    roleId: '',
    availableAmount: '',
  });

  useEffect(() => {
    if (!open || !userId) {
      setUser(null);
      setEditing(false);
      return;
    }
    setLoading(true);
    const sdk = SDK.getInstance();
    sdk
      .getUserDetailAdmin(userId)
      .then((res) => {
        const data = (res as any).data ?? res;
        setUser(data);
        setEditForm({
          fullName: data.fullName || '',
          introduce: data.introduce || '',
          roleId: data.roleId || '',
          availableAmount: String(data.availableAmount ?? 0),
        });
      })
      .catch(() => toast.error('Không thể tải thông tin người dùng'))
      .finally(() => setLoading(false));
  }, [userId, open]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const sdk = SDK.getInstance();
      const updateData: Record<string, any> = {};
      if (editForm.fullName !== user.fullName)
        updateData.fullName = editForm.fullName;
      if (editForm.introduce !== (user.introduce || ''))
        updateData.introduce = editForm.introduce;
      if (editForm.roleId !== user.roleId) updateData.roleId = editForm.roleId;
      if (Number(editForm.availableAmount) !== (user.availableAmount ?? 0))
        updateData.availableAmount = Number(editForm.availableAmount);

      if (Object.keys(updateData).length === 0) {
        setEditing(false);
        return;
      }

      const res = await sdk.updateUserAdmin(user.id, updateData);
      const data = (res as any).data ?? res;
      setUser(data);
      setEditing(false);
      onRefresh();
    } catch {
      /* interceptor handles error */
    } finally {
      setSaving(false);
    }
  };

  const handleBan = async (reason: string, timeUnBan?: string) => {
    if (!user) return;
    const sdk = SDK.getInstance();
    await sdk.banUser(user.id, { reason, timeUnBan });
    // Refresh user detail
    const res = await sdk.getUserDetailAdmin(user.id);
    const data = (res as any).data ?? res;
    setUser(data);
    onRefresh();
  };

  const handleUnban = async () => {
    if (!user) return;
    try {
      const sdk = SDK.getInstance();
      await sdk.unbanUser(user.id);
      const res = await sdk.getUserDetailAdmin(user.id);
      const data = (res as any).data ?? res;
      setUser(data);
      onRefresh();
    } catch {
      /* interceptor */
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      const sdk = SDK.getInstance();
      await sdk.deleteUser(user.id);
      const res = await sdk.getUserDetailAdmin(user.id);
      const data = (res as any).data ?? res;
      setUser(data);
      onRefresh();
    } catch {
      /* interceptor */
    }
  };

  const handleRestore = async () => {
    if (!user) return;
    try {
      const sdk = SDK.getInstance();
      await sdk.restoreUser(user.id);
      const res = await sdk.getUserDetailAdmin(user.id);
      const data = (res as any).data ?? res;
      setUser(data);
      onRefresh();
    } catch {
      /* interceptor */
    }
  };

  const [banDialog, setBanDialog] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="right"
          className="sm:max-w-lg w-full overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Chi tiết người dùng</SheetTitle>
          </SheetHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !user ? (
            <p className="text-center text-muted-foreground py-8">
              Không tìm thấy người dùng
            </p>
          ) : (
            <div className="space-y-6 px-4 pb-4">
              {/* Avatar & Basic Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">
                    {user.fullName}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <RoleBadge roleName={user.role?.name || 'User'} />
                    <BanStatusBadge user={user} />
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              {editing ? (
                <div className="space-y-4">
                  <div className="grid gap-1.5">
                    <Label>Họ tên</Label>
                    <Input
                      value={editForm.fullName}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Giới thiệu</Label>
                    <Textarea
                      value={editForm.introduce}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          introduce: e.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="Giới thiệu bản thân..."
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Vai trò</Label>
                    <Select
                      value={editForm.roleId}
                      onValueChange={(v) =>
                        setEditForm((prev) => ({ ...prev, roleId: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {user.role && (
                          <SelectItem value={user.roleId}>
                            {ROLE_BADGE[user.role.name]?.label ||
                              user.role.name}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Lưu ý: Để thay đổi vai trò, bạn cần nhập Role ID chính xác
                      từ hệ thống.
                    </p>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Số dư (VND)</Label>
                    <Input
                      type="number"
                      value={editForm.availableAmount}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          availableAmount: e.target.value,
                        }))
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Email
                    </Label>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  {user.slug && (
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        Slug
                      </Label>
                      <p className="text-sm">{user.slug}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Giới thiệu
                    </Label>
                    <p className="text-sm">{user.introduce || 'Chưa có'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Số dư
                    </Label>
                    <p className="text-sm font-medium">
                      {formatMoney(user.availableAmount ?? 0)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        Ngày tạo
                      </Label>
                      <p className="text-sm">{formatDate(user.createdAt)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        Cập nhật
                      </Label>
                      <p className="text-sm">{formatDate(user.updatedAt)}</p>
                    </div>
                  </div>

                  {/* Statistics */}
                  {user._count && (
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        Thống kê
                      </Label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div className="rounded-md border p-2 text-center">
                          <p className="text-lg font-semibold">
                            {user._count.courses ?? 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Khóa học tạo
                          </p>
                        </div>
                        <div className="rounded-md border p-2 text-center">
                          <p className="text-lg font-semibold">
                            {user._count.userCourses ?? 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Khóa học mua
                          </p>
                        </div>
                        <div className="rounded-md border p-2 text-center">
                          <p className="text-lg font-semibold">
                            {user._count.invoices ?? 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Hóa đơn
                          </p>
                        </div>
                        {user._count.reviews !== undefined && (
                          <div className="rounded-md border p-2 text-center">
                            <p className="text-lg font-semibold">
                              {user._count.reviews}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Đánh giá
                            </p>
                          </div>
                        )}
                        {user._count.transactions !== undefined && (
                          <div className="rounded-md border p-2 text-center">
                            <p className="text-lg font-semibold">
                              {user._count.transactions}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Giao dịch
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ban Info */}
                  {user.ban && (
                    <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-950/20 p-3">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        Thông tin cấm
                      </p>
                      <p className="text-sm mt-1">
                        <span className="text-muted-foreground">Lý do: </span>
                        {user.ban.reason}
                      </p>
                      {user.timeBan && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">
                            Thời gian cấm:{' '}
                          </span>
                          {formatDate(user.timeBan)}
                        </p>
                      )}
                      <p className="text-sm">
                        <span className="text-muted-foreground">Hết cấm: </span>
                        {user.timeUnBan
                          ? formatDate(user.timeUnBan)
                          : 'Vĩnh viễn'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          {user && !loading && (
            <SheetFooter className="border-t pt-4">
              {editing ? (
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    Hủy
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 w-full">
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    Chỉnh sửa
                  </Button>
                  {user.banId ? (
                    <Button variant="outline" onClick={handleUnban}>
                      <ShieldOff className="mr-1 h-4 w-4" />
                      Bỏ cấm
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={() => setBanDialog(true)}
                    >
                      <Shield className="mr-1 h-4 w-4" />
                      Cấm
                    </Button>
                  )}
                  {user.isDeleted ? (
                    <Button variant="outline" onClick={handleRestore}>
                      <RotateCcw className="mr-1 h-4 w-4" />
                      Khôi phục
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={handleDelete}>
                      <Trash2 className="mr-1 h-4 w-4" />
                      Xóa
                    </Button>
                  )}
                </div>
              )}
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      {/* Ban Dialog */}
      {user && (
        <BanDialog
          open={banDialog}
          onClose={() => setBanDialog(false)}
          onBan={handleBan}
          userName={user.fullName}
        />
      )}
    </>
  );
}

// ─── Date Picker Field ───────────────────────────────────────────────────────

function DatePickerField({
  value,
  onChange,
  placeholder,
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-35 justify-start text-left font-normal text-xs',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-1 h-3 w-3" />
          {value ? format(value, 'dd/MM/yyyy', { locale: vi }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [bannedFilter, setBannedFilter] = useState('all');
  const [deletedFilter, setDeletedFilter] = useState('all');
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Drawer
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const sdk = SDK.getInstance();
      const params: AdminUserListParams = {
        page: String(page),
        limit: String(limit),
        sortBy,
        order,
      };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'all') params.roleName = roleFilter;
      if (bannedFilter !== 'all') params.isBanned = bannedFilter;
      if (deletedFilter !== 'all') params.isDeleted = deletedFilter;
      if (fromDate) params.fromDate = fromDate.toISOString().split('T')[0];
      if (toDate) params.toDate = toDate.toISOString().split('T')[0];

      const res = await sdk.getAllUsersAdmin(params);
      const data = (res as any).data ?? [];
      const resMeta = (res as any).meta ?? {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
      setUsers(Array.isArray(data) ? data : []);
      setMeta(resMeta);
    } catch {
      /* interceptor handles */
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    roleFilter,
    bannedFilter,
    deletedFilter,
    fromDate,
    toDate,
    sortBy,
    order,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('desc');
    }
    setPage(1);
  };

  const openDrawer = (userId: string) => {
    setSelectedUserId(userId);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedUserId(null);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearch('');
    setRoleFilter('all');
    setBannedFilter('all');
    setDeletedFilter('all');
    setFromDate(undefined);
    setToDate(undefined);
    setSortBy('createdAt');
    setOrder('desc');
    setPage(1);
  };

  const hasActiveFilters =
    roleFilter !== 'all' ||
    bannedFilter !== 'all' ||
    deletedFilter !== 'all' ||
    fromDate !== undefined ||
    toDate !== undefined;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Quản lý người dùng</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tổng cộng <span className="font-medium">{meta.total}</span> người dùng
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-50 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="pl-9"
            />
          </div>

          {/* Role Filter */}
          <Select
            value={roleFilter}
            onValueChange={(v) => {
              setRoleFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Banned Filter */}
          <Select
            value={bannedFilter}
            onValueChange={(v) => {
              setBannedFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BANNED_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Deleted Filter */}
          <Select
            value={deletedFilter}
            onValueChange={(v) => {
              setDeletedFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-35">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DELETED_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range & Sort */}
        <div className="flex items-center gap-3 flex-wrap">
          <DatePickerField
            value={fromDate}
            onChange={(d) => {
              setFromDate(d);
              setPage(1);
            }}
            placeholder="Từ ngày"
          />
          <DatePickerField
            value={toDate}
            onChange={(d) => {
              setToDate(d);
              setPage(1);
            }}
            placeholder="Đến ngày"
          />

          <Select
            value={sortBy}
            onValueChange={(v) => {
              setSortBy(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-35">
              <ArrowUpDown className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
            }
          >
            {order === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-2 opacity-50" />
              <p>Không có người dùng nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-62.5">
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => handleSort('fullName')}
                    >
                      Người dùng
                      {sortBy === 'fullName' && (
                        <span className="text-xs">
                          {order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => handleSort('email')}
                    >
                      Email
                      {sortBy === 'email' && (
                        <span className="text-xs">
                          {order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => handleSort('availableAmount')}
                    >
                      Số dư
                      {sortBy === 'availableAmount' && (
                        <span className="text-xs">
                          {order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => handleSort('createdAt')}
                    >
                      Ngày tạo
                      {sortBy === 'createdAt' && (
                        <span className="text-xs">
                          {order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="w-12.5" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.fullName} />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium truncate max-w-45">
                          {user.fullName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground truncate max-w-50 block">
                        {user.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <RoleBadge roleName={user.role?.name || 'User'} />
                    </TableCell>
                    <TableCell>
                      <BanStatusBadge user={user} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatMoney(user.availableAmount ?? 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDateShort(user.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDrawer(user.id)}>
                            Chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.banId ? (
                            <DropdownMenuItem
                              onClick={async () => {
                                try {
                                  const sdk = SDK.getInstance();
                                  await sdk.unbanUser(user.id);
                                  fetchUsers();
                                } catch {
                                  /* interceptor */
                                }
                              }}
                            >
                              <ShieldOff className="mr-2 h-4 w-4" />
                              Bỏ cấm
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => openDrawer(user.id)}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Cấm
                            </DropdownMenuItem>
                          )}
                          {user.isDeleted ? (
                            <DropdownMenuItem
                              onClick={async () => {
                                try {
                                  const sdk = SDK.getInstance();
                                  await sdk.restoreUser(user.id);
                                  fetchUsers();
                                } catch {
                                  /* interceptor */
                                }
                              }}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Khôi phục
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={async () => {
                                try {
                                  const sdk = SDK.getInstance();
                                  await sdk.deleteUser(user.id);
                                  fetchUsers();
                                } catch {
                                  /* interceptor */
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {meta.page} / {meta.totalPages} (tổng {meta.total} người dùng)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* User Detail Drawer */}
      <UserDetailDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        userId={selectedUserId}
        onRefresh={fetchUsers}
      />
    </div>
  );
}
