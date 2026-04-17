"use client";

import React, { useEffect, useState } from 'react';
import SDK from '@/stores/sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function RoleManagement() {
  const sdk = SDK.getInstance();
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [permissions, setPermissions] = useState<any[]>([]);

  // Core roles (case-insensitive)
  const CORE_ROLES = ['admin', 'user', 'teacher'];

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoles = async () => {
    try {
      const res: any = await (sdk as any).getRoles();
      const data = res?.data ?? res;
      const list = data || [];
      // Put core roles first (Admin, User, Teacher), then others sorted by createdAt desc
      const cores: any[] = [];
      const others: any[] = [];
      for (const name of CORE_ROLES) {
        const found = list.find((r: any) => r.name && r.name.toLowerCase() === name);
        if (found) cores.push(found);
      }
      for (const r of list) {
        if (!cores.find((c) => c.id === r.id)) others.push(r);
      }
      others.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const ordered = [...cores, ...others];
      setRoles(ordered);
      if (!selectedRole && ordered.length > 0) setSelectedRole(ordered[0]);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res: any = await (sdk as any).getPermissions();
      const data = res?.data ?? res;
      setPermissions(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectRole = (r: any) => {
    setSelectedRole(r);
  };

  const isCore = (role: any) => {
    if (!role) return false;
    return CORE_ROLES.includes(role.name?.toLowerCase?.());
  };

  const handleCreateRole = async () => {
    openPrompt({
      title: 'Tên vai trò mới',
      defaultValue: '',
      onConfirm: async (name: string) => {
        if (!name) return;
        try {
          await (sdk as any).createRole({ name });
          toast.success('Tạo vai trò thành công');
          await fetchRoles();
        } catch (e: any) {
          toast.error(e?.message || 'Lỗi');
        }
      },
    });
  };

  const handleUpdateRoleName = async (role: any) => {
    if (isCore(role)) return;
    openPrompt({
      title: 'Sửa tên vai trò',
      defaultValue: role.name,
      onConfirm: async (name: string) => {
        if (!name || name === role.name) return;
        try {
          await (sdk as any).updateRole(role.id, { name });
          toast.success('Cập nhật vai trò');
          fetchRoles();
        } catch (e: any) {
          toast.error(e?.message || 'Lỗi');
        }
      },
    });
  };

  // Modal states and helpers
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState<string | undefined>('');
  const [modalDefault, setModalDefault] = useState('');
  const [modalType, setModalType] = useState<'prompt' | 'confirm' | null>(null);
  const [modalOnConfirm, setModalOnConfirm] = useState<((val?: string) => void) | null>(null);
  const [modalInput, setModalInput] = useState('');

  const openPrompt = ({ title, defaultValue, onConfirm, description }: { title: string; defaultValue?: string; onConfirm: (val: string) => void; description?: string; }) => {
    setModalTitle(title);
    setModalDefault(defaultValue || '');
    setModalInput(defaultValue || '');
    setModalDescription(description);
    setModalType('prompt');
    setModalOnConfirm(() => onConfirm);
    setModalOpen(true);
  };

  const openConfirm = ({ title, description, onConfirm }: { title: string; description?: string; onConfirm: () => void; }) => {
    setModalTitle(title);
    setModalDescription(description);
    setModalType('confirm');
    setModalOnConfirm(() => () => onConfirm());
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalType(null);
    setModalOnConfirm(null);
    setModalInput('');
    setModalDefault('');
  };

  const handleModalConfirm = async () => {
    if (modalOnConfirm) {
      try {
        if (modalType === 'prompt') {
          await modalOnConfirm(modalInput);
        } else {
          await modalOnConfirm();
        }
      } catch (e) {
        console.error(e);
      }
    }
    handleModalClose();
  };

  return (
    <div className="flex gap-6 p-6 space-y-6">
      <div className="w-1/3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Roles</h3>
          <div>
            <Button size="sm" onClick={handleCreateRole}>Tạo</Button>
          </div>
        </div>
        <div className="border rounded-md overflow-auto max-h-[60vh]">
          <ul>
            {roles.map((r) => (
              <li key={r.id} className={`p-3 border-b cursor-pointer ${selectedRole?.id === r.id ? 'bg-muted/30' : ''}`} onClick={() => handleSelectRole(r)}>
                <div className="flex justify-between items-center">
                  <div>{r.name}</div>
                  <div className="flex gap-2">
                    {!isCore(r) ? (
                      <Button size="sm" variant="outline" onClick={(e: any) => { e.stopPropagation(); handleUpdateRoleName(r); }}>
                        Sửa
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Permissions</h3>
          <div>
            <Button size="sm" onClick={() => openPrompt({
              title: 'Tạo permission',
              defaultValue: '/api/',
              onConfirm: async (api: string) => {
                if (!api) return;
                try {
                  await (sdk as any).createPermission({ api });
                  toast.success('Tạo permission thành công');
                  await fetchPermissions();
                } catch (e: any) {
                  toast.error(e?.message || 'Lỗi');
                }
              }
            })}>Tạo permission</Button>
          </div>
        </div>
        <div className="mt-2 overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Permission</TableHead>
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                  <TableHead key={m} className="text-center">{m}</TableHead>
                ))}
                <TableHead className="text-center">ALL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((p) => {
                const rp = selectedRole?.rolePermissions?.find((r: any) => r.permission?.id === p.id);
                const methodsStr = rp?.methods ?? '';
                const methodsSet = new Set(methodsStr.split(/[|,]/).filter(Boolean));
                const allChecked = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].every((mm) => methodsSet.has(mm));
                return (
                  <TableRow key={p.id}>
                    <TableCell>{p.api}</TableCell>
                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => {
                      const checked = methodsSet.has(m);
                      return (
                        <TableCell key={m} className="text-center">
                          <Checkbox
                            checked={checked}
                            disabled={isCore(selectedRole)}
                            onCheckedChange={async (val) => {
                              if (!selectedRole) return toast.error('Chọn vai trò');
                              if (isCore(selectedRole)) return;
                              try {
                                if (val) {
                                  // add method
                                  if (rp) {
                                    const newMethods = Array.from(new Set([...methodsSet, m])).join(',');
                                    await (sdk as any).updateRolePermission(selectedRole.id, rp.permission.id, { methods: newMethods });
                                  } else {
                                    await (sdk as any).assignPermission(selectedRole.id, { permissionId: p.id, methods: m });
                                  }
                                } else {
                                  // remove method
                                  if (!rp) return; // nothing to do
                                  const newMethodsArr = Array.from(methodsSet).filter((x) => x !== m);
                                  if (newMethodsArr.length === 0) {
                                    await (sdk as any).removeRolePermission(selectedRole.id, rp.permission.id);
                                  } else {
                                    await (sdk as any).updateRolePermission(selectedRole.id, rp.permission.id, { methods: newMethodsArr.join(',') });
                                  }
                                }
                                const res: any = await (sdk as any).getRole(selectedRole.id);
                                setSelectedRole(res?.data ?? res);
                              } catch (e: any) {
                                toast.error(e?.message || 'Lỗi');
                              }
                            }}
                          />
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center">
                      <Checkbox
                        checked={allChecked}
                        disabled={isCore(selectedRole)}
                        onCheckedChange={async (val) => {
                          if (!selectedRole) return toast.error('Chọn vai trò');
                          if (isCore(selectedRole)) return;
                          try {
                            const allMethods = 'GET,POST,PUT,PATCH,DELETE';
                            if (val) {
                              if (rp) {
                                await (sdk as any).updateRolePermission(selectedRole.id, rp.permission.id, { methods: allMethods });
                              } else {
                                await (sdk as any).assignPermission(selectedRole.id, { permissionId: p.id, methods: allMethods });
                              }
                            } else {
                              if (rp) {
                                await (sdk as any).removeRolePermission(selectedRole.id, rp.permission.id);
                              }
                            }
                            const res: any = await (sdk as any).getRole(selectedRole.id);
                            setSelectedRole(res?.data ?? res);
                          } catch (e: any) {
                            toast.error(e?.message || 'Lỗi');
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) handleModalClose(); else setModalOpen(true); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            {modalDescription ? <DialogDescription>{modalDescription}</DialogDescription> : null}
          </DialogHeader>
          {modalType === 'prompt' ? (
            <div className="mt-2">
              <Label>Giá trị</Label>
              <Input value={modalInput} onChange={(e) => setModalInput(e.target.value)} />
            </div>
          ) : null}
          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleModalClose}>Hủy</Button>
              <Button onClick={handleModalConfirm}>Xác nhận</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RoleManagement;
