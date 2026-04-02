import { useSdk } from "@/hooks/use-my-cookies";
import SettingsPanel from "@/components/admin/settings-panel";

export default async function AdminSetting() {
  const sdk = await useSdk();
  const { data: system } = await sdk.getSystem();
  const { data: banks } = await sdk.getBanks();

  return <SettingsPanel initialSystem={system} initialBanks={banks} />;
}