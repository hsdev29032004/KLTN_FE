'use client';

import { useEffect, useRef, useState } from 'react';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RichTextEditor, RichTextEditorRef } from '@/components/common/rich-text-editor';
import type { SystemConfig } from '@/types/system.type';
import type { Bank } from '@/types/bank.type';
import { useBankStore } from '@/stores/bank/bank-store';
import { useSystemStore } from '@/stores/system/system-store';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BankForm {
  bankName: string;
  bankNumber: string;
  recipient: string;
}

const emptyBankForm: BankForm = { bankName: '', bankNumber: '', recipient: '' };

interface VietQRBank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}

// ─── Hook: fetch VietQR bank list ─────────────────────────────────────────────

function useVietQRBanks() {
  const [banks, setBanks] = useState<VietQRBank[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('https://api.vietqr.io/v2/banks')
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json?.data)) {
          setBanks(json.data);
        }
      })
      .catch(() => toast.error('Không thể tải danh sách ngân hàng'))
      .finally(() => setLoading(false));
  }, []);

  return { banks, loading };
}

// ─── Bank Dialog ─────────────────────────────────────────────────────────────

function BankDialog({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: BankForm & { id?: string };
  onSave: (form: BankForm, id?: string) => Promise<void>;
}) {
  const [form, setForm] = useState<BankForm>(initial ?? emptyBankForm);
  const [loading, setLoading] = useState(false);
  const { banks: vietQRBanks, loading: banksLoading } = useVietQRBanks();

  const handleChange = (field: keyof BankForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.bankName.trim() || !form.bankNumber.trim() || !form.recipient.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      await onSave(form, initial?.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.id ? 'Chỉnh sửa ngân hàng' : 'Thêm ngân hàng'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5 w-full">
            <Label htmlFor="bankName">Tên ngân hàng</Label>
            <Select
              value={form.bankName}
              onValueChange={(value) => setForm((prev) => ({ ...prev, bankName: value }))}
              disabled={banksLoading}
            >
              <SelectTrigger id="bankName">
                <SelectValue placeholder={banksLoading ? 'Đang tải...' : 'Chọn ngân hàng'} />
              </SelectTrigger>
              <SelectContent>
                {vietQRBanks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.shortName}>
                    {bank.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bankNumber">Số tài khoản</Label>
            <Input
              id="bankNumber"
              value={form.bankNumber}
              onChange={handleChange('bankNumber')}
              placeholder="1032850000"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="recipient">Chủ tài khoản</Label>
            <Input
              id="recipient"
              value={form.recipient}
              onChange={handleChange('recipient')}
              placeholder="KLTN Academy"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <X className="mr-1 h-4 w-4" /> Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="mr-1 h-4 w-4" />
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteDialog({
  open,
  onClose,
  onConfirm,
  bankName,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  bankName: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Bạn có chắc chắn muốn xóa ngân hàng <span className="font-medium text-foreground">{bankName}</span>?
          Hành động này không thể hoàn tác.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface SettingsPanelProps {
  initialSystem: SystemConfig;
  initialBanks: Bank[];
}

export default function SettingsPanel({ initialSystem, initialBanks }: SettingsPanelProps) {
  const bankStore = useBankStore();
  const systemStore = useSystemStore();

  useEffect(() => {
    bankStore.setList(initialBanks);
    systemStore.setData(initialSystem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const banks = bankStore.list?.length ? bankStore.list : initialBanks;
  const system = systemStore.data ?? initialSystem;

  // Local controlled state for commission rate input
  const [commissionRate, setCommissionRate] = useState(initialSystem.comissionRate);
  const [savingSystem, setSavingSystem] = useState(false);
  const termEditorRef = useRef<RichTextEditorRef>(null);
  const contactEditorRef = useRef<RichTextEditorRef>(null);

  // Dialog state
  const [bankDialog, setBankDialog] = useState<{ open: boolean; bank?: Bank }>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; bank?: Bank }>({ open: false });

  // ── System handlers ──────────────────────────────────────────────────────

  const handleSaveSystem = async () => {
    const rate = Number(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Tỉ lệ hoa hồng phải là số từ 0 đến 100');
      return;
    }
    setSavingSystem(true);
    try {
      const term = termEditorRef.current?.getContent() ?? system.term;
      const contact = contactEditorRef.current?.getContent() ?? system.contact;
      const result = await systemStore.updateSystem({ comissionRate: commissionRate, contact, term });
      if ((result as any).error) return;
      toast.success('Đã lưu cấu hình hệ thống');
    } finally {
      setSavingSystem(false);
    }
  };

  // ── Bank handlers ────────────────────────────────────────────────────────

  const handleSaveBank = async (form: BankForm, id?: string) => {
    if (id) {
      const result = await bankStore.updateBank(id, form);
      if ((result as any).error) return;
      toast.success('Đã cập nhật ngân hàng');
    } else {
      const result = await bankStore.createBank(form);
      if ((result as any).error) return;
      toast.success('Đã thêm ngân hàng');
    }
  };

  const handleDeleteBank = async () => {
    if (!deleteDialog.bank) return;
    const result = await bankStore.deleteBank(deleteDialog.bank.id);
    if ((result as any).error) return;
    toast.success('Đã xóa ngân hàng');
  };

  const openEdit = (bank: Bank) => setBankDialog({ open: true, bank });
  const openDelete = (bank: Bank) => setDeleteDialog({ open: true, bank });

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* ── Banks ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tài khoản ngân hàng</CardTitle>
          <Button onClick={() => setBankDialog({ open: true })}>
            <Plus className="mr-1 h-4 w-4" /> Thêm ngân hàng
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-y-auto" style={{ maxHeight: 500 }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên ngân hàng</TableHead>
                  <TableHead>Số tài khoản</TableHead>
                  <TableHead>Chủ tài khoản</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Chưa có tài khoản ngân hàng nào
                    </TableCell>
                  </TableRow>
                )}
                {banks.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium">{bank.bankName}</TableCell>
                    <TableCell className="font-mono">{bank.bankNumber}</TableCell>
                    <TableCell>{bank.recipient}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(bank)}
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDelete(bank)}
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── System Config ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cấu hình hệ thống</CardTitle>
          <Button onClick={handleSaveSystem} disabled={savingSystem}>
            <Save className="mr-1 h-4 w-4" />
            {savingSystem ? 'Đang lưu...' : 'Lưu cấu hình'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-1.5">
            <Label htmlFor="commissionRate">Tỉ lệ hoa hồng (%)</Label>
            <Input
              id="commissionRate"
              type="number"
              min={0}
              max={100}
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              placeholder="60"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Chính sách bảo mật</Label>
            <RichTextEditor
              ref={contactEditorRef}
              initialValue={system.contact}
              height={240}
              placeholder="Nhập thông tin liên hệ..."
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Điều khoản sử dụng</Label>
            <RichTextEditor
              ref={termEditorRef}
              initialValue={system.term}
              height={320}
              placeholder="Nhập điều khoản sử dụng..."
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Dialogs ───────────────────────────────────────────────────── */}
      {/* key resets form state when switching between banks or add/edit */}
      <BankDialog
        key={bankDialog.bank?.id ?? 'new'}
        open={bankDialog.open}
        onClose={() => setBankDialog({ open: false })}
        initial={
          bankDialog.bank
            ? {
              id: bankDialog.bank.id,
              bankName: bankDialog.bank.bankName,
              bankNumber: bankDialog.bank.bankNumber,
              recipient: bankDialog.bank.recipient,
            }
            : undefined
        }
        onSave={handleSaveBank}
      />

      <DeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
        onConfirm={handleDeleteBank}
        bankName={deleteDialog.bank ? `${deleteDialog.bank.bankName} - ${deleteDialog.bank.bankNumber}` : ''}
      />
    </div>
  );
}