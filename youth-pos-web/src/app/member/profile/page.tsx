"use client";
import ScrollReveal from "@/components/ScrollReveal";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Home,
  LocateFixed,
  MapPin,
  Navigation,
  Plus,
  Star,
  Trash2,
  UserRound,
  Waves,
} from "lucide-react";
import AiPosLogo from "@/components/AiPosLogo";
import {
  initialLocationPoints,
  LocationPoint,
} from "@/data/locationPoints";
import { MemberAddress, MemberAddressType } from "@/data/memberAddresses";

type CurrentUser = {
  id: number;
  name: string;
  fullName?: string;
  email: string;
  role: "admin-master" | "cashier" | "member";
  kosLocationId?: number;
  kosLabel?: string;
  manualAddress?: string;
};

type AddressForm = {
  label: string;
  receiverName: string;
  phone: string;
  type: MemberAddressType;
  kosLocationId: string;
  manualAddress: string;
  detailNote: string;
  lat: string;
  lng: string;
};

export default function MemberProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [addresses, setAddresses] = useState<MemberAddress[]>([]);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<AddressForm>({
    label: "",
    receiverName: "",
    phone: "",
    type: "kos-point",
    kosLocationId: "",
    manualAddress: "",
    detailNote: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    const raw = localStorage.getItem("aipos_current_user");

    if (!raw) {
      router.push("/");
      return;
    }

    const parsed = JSON.parse(raw);

    if (parsed.role !== "member" && parsed.role !== "cashier") {
      router.push("/");
      return;
    }

    setUser(parsed);

    const savedLocations = localStorage.getItem("aipos_location_points");
    const savedAddresses = localStorage.getItem("aipos_member_addresses");

    if (savedLocations) {
      setLocations(JSON.parse(savedLocations));
    } else {
      setLocations(initialLocationPoints);
      localStorage.setItem(
        "aipos_location_points",
        JSON.stringify(initialLocationPoints)
      );
    }

    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }
  }, [router]);

  const userAddresses = useMemo(() => {
    if (!user) return [];

    return addresses.filter(
      (item) => item.memberEmail.toLowerCase() === user.email.toLowerCase()
    );
  }, [addresses, user]);

  const activeLocations = locations.filter((item) => item.isActive);

  const selectedLocation =
    activeLocations.find((item) => item.id === Number(form.kosLocationId)) ||
    null;

  const mapLat =
    form.type === "kos-point"
      ? selectedLocation?.lat
      : form.lat
        ? Number(form.lat)
        : undefined;

  const mapLng =
    form.type === "kos-point"
      ? selectedLocation?.lng
      : form.lng
        ? Number(form.lng)
        : undefined;

  function saveAddresses(next: MemberAddress[]) {
    setAddresses(next);
    localStorage.setItem("aipos_member_addresses", JSON.stringify(next));
  }

  function addAddress(e: React.FormEvent) {
    e.preventDefault();
    setSuccess("");

    if (!user) return;

    if (!form.label || !form.receiverName || !form.phone) {
      alert("Label alamat, nama penerima, dan nomor HP wajib diisi.");
      return;
    }

    if (form.type === "kos-point" && !selectedLocation) {
      alert("Pilih titik kos terlebih dahulu.");
      return;
    }

    if (form.type === "manual" && !form.manualAddress) {
      alert("Isi alamat manual terlebih dahulu.");
      return;
    }

    if (form.type === "maps" && (!form.lat || !form.lng)) {
      alert("Isi latitude dan longitude untuk alamat maps.");
      return;
    }

    const newAddress: MemberAddress = {
      id: Date.now(),
      memberEmail: user.email,
      label: form.label,
      receiverName: form.receiverName,
      phone: form.phone,
      type: form.type,
      kosLocationId: selectedLocation?.id,
      kosLabel: selectedLocation
        ? `${selectedLocation.label} - ${selectedLocation.roomNumber}`
        : undefined,
      manualAddress: form.manualAddress || undefined,
      detailNote: form.detailNote,
      lat: mapLat,
      lng: mapLng,
      isPrimary: userAddresses.length === 0,
      createdAt: new Date().toISOString(),
    };

    const next = [newAddress, ...addresses];
    saveAddresses(next);

    setForm({
      label: "",
      receiverName: "",
      phone: "",
      type: "kos-point",
      kosLocationId: "",
      manualAddress: "",
      detailNote: "",
      lat: "",
      lng: "",
    });

    setSuccess("Alamat berhasil ditambahkan.");
  }

  function deleteAddress(id: number) {
    if (!confirm("Hapus alamat ini?")) return;

    const next = addresses.filter((item) => item.id !== id);
    saveAddresses(next);
  }

  function setPrimaryAddress(id: number) {
    if (!user) return;

    const next = addresses.map((item) => {
      if (item.memberEmail.toLowerCase() !== user.email.toLowerCase()) {
        return item;
      }

      return {
        ...item,
        isPrimary: item.id === id,
      };
    });

    saveAddresses(next);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung geolocation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          type: "maps",
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
        }));
      },
      () => {
        alert("Gagal mengambil lokasi. Pastikan izin lokasi aktif.");
      }
    );
  }

  if (!user) return null;

  return (
    <main className="relative min-h-screen overflow-hidden ocean-bg text-[#06243a]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[8%] top-[12%] h-80 w-80 rounded-full bg-cyan-300/45 blur-[110px] float-soft" />
        <div className="absolute right-[8%] bottom-[8%] h-96 w-96 rounded-full bg-white/80 blur-[120px]" />
        <span className="bubble left-[14%] top-[78%] h-5 w-5" />
        <span className="bubble right-[20%] top-[72%] h-6 w-6" style={{ animationDelay: "1.4s" }} />
      </div>

      <nav className="sticky top-0 z-40 border-b border-sky-900/10 bg-white/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <AiPosLogo dark />

          <div className="flex items-center gap-2">
            <a
              href="/member"
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#06243a] shadow-sm"
            >
              <ArrowLeft size={16} />
              Order
            </a>

            <a
              href="/"
              className="rounded-full bg-[#06243a] px-4 py-2 text-sm font-black text-white"
            >
              Home
            </a>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 grid gap-5 lg:grid-cols-[360px_1fr]">
          <ScrollReveal direction="left">
          <aside className="ocean-card h-fit rounded-[2rem] p-6">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-xl shadow-cyan-500/25">
              <UserRound size={32} />
            </div>

            <p className="text-sm font-bold text-sky-700">Profile Member</p>
            <h1 className="mt-2 text-3xl font-black">
              {user.fullName || user.name}
            </h1>
            <p className="mt-1 text-black/50">{user.email}</p>

            <div className="mt-6 rounded-3xl bg-cyan-50 p-4">
              <p className="text-sm text-black/45">Alamat utama</p>
              {userAddresses.find((item) => item.isPrimary) ? (
                <p className="mt-1 font-black text-sky-700">
                  {userAddresses.find((item) => item.isPrimary)?.label}
                </p>
              ) : (
                <p className="mt-1 text-sm text-black/45">
                  Belum ada alamat utama.
                </p>
              )}
            </div>
          </aside>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={120}>
          <section className="ocean-card rounded-[2rem] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-white">
                <Plus />
              </div>
              <div>
                <h2 className="text-2xl font-black">Tambah Alamat</h2>
                <p className="text-sm text-black/50">
                  Simpan alamat seperti aplikasi Grab/Gojek: kos, manual, atau maps.
                </p>
              </div>
            </div>

            <form onSubmit={addAddress} className="grid gap-4 md:grid-cols-2">
              <Input
                label="Label Alamat"
                value={form.label}
                onChange={(value) => setForm((prev) => ({ ...prev, label: value }))}
                placeholder="Kos utama / Rumah / Kantor"
              />

              <Input
                label="Nama Penerima"
                value={form.receiverName}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, receiverName: value }))
                }
                placeholder="Nama penerima"
              />

              <Input
                label="Nomor HP"
                value={form.phone}
                onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
                placeholder="08xxxxxxxxxx"
              />

              <label>
                <span className="text-sm font-bold text-black/60">
                  Tipe Alamat
                </span>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as MemberAddressType,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-sky-900/10 bg-white px-4 py-4 outline-none"
                >
                  <option value="kos-point">Pilih Titik Kos</option>
                  <option value="manual">Isi Manual</option>
                  <option value="maps">Pilih Lewat Maps</option>
                </select>
              </label>

              {form.type === "kos-point" && (
                <label className="md:col-span-2">
                  <span className="text-sm font-bold text-black/60">
                    Titik Kos / Rumah
                  </span>
                  <select
                    value={form.kosLocationId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        kosLocationId: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-sky-900/10 bg-white px-4 py-4 outline-none"
                  >
                    <option value="">Pilih titik kos</option>
                    {activeLocations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.label} - {location.roomNumber} - {location.area}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {form.type === "manual" && (
                <label className="md:col-span-2">
                  <span className="text-sm font-bold text-black/60">
                    Alamat Manual
                  </span>
                  <textarea
                    value={form.manualAddress}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        manualAddress: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Contoh: Kos Putra Mandiri, kamar 12, gang sebelah warung..."
                    className="mt-2 w-full resize-none rounded-2xl border border-sky-900/10 bg-white px-4 py-4 outline-none placeholder:text-black/30"
                  />
                </label>
              )}

              {form.type === "maps" && (
                <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                  <Input
                    label="Latitude"
                    value={form.lat}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, lat: value }))
                    }
                    placeholder="-6.2000"
                  />

                  <Input
                    label="Longitude"
                    value={form.lng}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, lng: value }))
                    }
                    placeholder="106.8166"
                  />

                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    className="md:col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-cyan-100 px-5 py-4 font-black text-sky-700"
                  >
                    <LocateFixed size={18} />
                    Gunakan Lokasi Saya
                  </button>
                </div>
              )}

              <label className="md:col-span-2">
                <span className="text-sm font-bold text-black/60">
                  Detail / Catatan Alamat
                </span>
                <textarea
                  value={form.detailNote}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, detailNote: e.target.value }))
                  }
                  rows={3}
                  placeholder="Contoh: kamar lantai 2, pagar biru, chat dulu sebelum sampai..."
                  className="mt-2 w-full resize-none rounded-2xl border border-sky-900/10 bg-white px-4 py-4 outline-none placeholder:text-black/30"
                />
              </label>

              {(mapLat && mapLng) && (
                <div className="md:col-span-2 overflow-hidden rounded-3xl border border-sky-900/10 bg-white">
                  <div className="flex items-center gap-2 p-4 font-black text-sky-700">
                    <MapPin size={18} />
                    Preview Maps
                  </div>

                  <iframe
                    title="Preview alamat"
                    src={`https://maps.google.com/maps?q=${mapLat},${mapLng}&z=17&output=embed`}
                    className="h-64 w-full"
                    loading="lazy"
                  />
                </div>
              )}

              {success && (
                <div className="md:col-span-2 flex items-center gap-2 rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-700">
                  <CheckCircle2 size={17} />
                  {success}
                </div>
              )}

              <button className="md:col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-[#06243a] px-6 py-4 font-black text-white">
                <Home size={18} />
                Simpan Alamat
              </button>
            </form>
          </section>
          </ScrollReveal>
        </div>

        <section className="ocean-card rounded-[2rem] p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-white">
              <Navigation />
            </div>
            <div>
              <h2 className="text-2xl font-black">Alamat Saya</h2>
              <p className="text-sm text-black/50">
                Pilih alamat utama untuk pesanan berikutnya.
              </p>
            </div>
          </div>

          
          <div className="grid gap-4 md:grid-cols-2">
            {userAddresses.map((address, index) => (
  <ScrollReveal key={address.id} delay={index * 80} direction="up">
    <div className="rounded-3xl border border-sky-900/10 bg-white/80 p-5 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black">{address.label}</h3>
                      {address.isPrimary && (
                        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-sky-700">
                          Utama
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-black/45">
                      {address.receiverName} · {address.phone}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteAddress(address.id)}
                    className="text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="rounded-2xl bg-cyan-50 p-4 text-sm text-black/60">
                  {address.type === "kos-point" && (
                    <p>
                      <strong>{address.kosLabel}</strong>
                    </p>
                  )}

                  {address.type === "manual" && (
                    <p>{address.manualAddress}</p>
                  )}

                  {address.type === "maps" && (
                    <p>
                      Maps: {address.lat}, {address.lng}
                    </p>
                  )}

                  {address.detailNote && (
                    <p className="mt-2 text-black/45">{address.detailNote}</p>
                  )}
                </div>

                {address.lat && address.lng && (
                  <iframe
                    title={address.label}
                    src={`https://maps.google.com/maps?q=${address.lat},${address.lng}&z=17&output=embed`}
                    className="mt-4 h-40 w-full rounded-2xl border border-sky-900/10"
                    loading="lazy"
                  />
                )}

                {!address.isPrimary && (
                  <button
                    onClick={() => setPrimaryAddress(address.id)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-100 px-4 py-3 font-black text-sky-700"
                  >
                    <Star size={17} />
                    Jadikan Alamat Utama
                  </button>
                )}
              </div>
  </ScrollReveal>
))}
          </div>

          {userAddresses.length === 0 && (
            <div className="rounded-3xl border border-dashed border-sky-900/20 bg-white/60 p-10 text-center">
              <Waves className="mx-auto text-sky-700" size={48} />
              <h3 className="mt-4 text-2xl font-black">
                Belum ada alamat tersimpan
              </h3>
              <p className="mt-2 text-black/50">
                Tambahkan alamat kos, manual, atau maps terlebih dahulu.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label>
      <span className="text-sm font-bold text-black/60">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-sky-900/10 bg-white px-4 py-4 outline-none placeholder:text-black/30"
      />
    </label>
  );
}