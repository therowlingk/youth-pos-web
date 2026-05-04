export type LocationPoint = {
  id: number;
  label: string;
  area: string;
  roomNumber: string;
  note: string;
  lat: number;
  lng: number;
  isActive: boolean;
};

export const initialLocationPoints: LocationPoint[] = [
  {
    id: 1,
    label: "Kos Melati",
    area: "Gang Utama",
    roomNumber: "Kamar 01",
    note: "Dekat gerbang hitam",
    lat: -6.2,
    lng: 106.816666,
    isActive: true,
  },
  {
    id: 2,
    label: "Kos Anggrek",
    area: "Belakang warung",
    roomNumber: "Kamar 02",
    note: "Lantai 2 sebelah kanan",
    lat: -6.2005,
    lng: 106.817,
    isActive: true,
  },
  {
    id: 3,
    label: "Kontrakan Biru",
    area: "Sebelah mushola",
    roomNumber: "Nomor 03",
    note: "Pagar warna biru",
    lat: -6.201,
    lng: 106.8175,
    isActive: true,
  },
];