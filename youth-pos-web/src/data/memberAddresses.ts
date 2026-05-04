export type MemberAddressType = "kos-point" | "manual" | "maps";

export type MemberAddress = {
  id: number;
  memberEmail: string;
  label: string;
  receiverName: string;
  phone: string;
  type: MemberAddressType;
  kosLocationId?: number;
  kosLabel?: string;
  manualAddress?: string;
  detailNote?: string;
  lat?: number;
  lng?: number;
  isPrimary: boolean;
  createdAt: string;
};