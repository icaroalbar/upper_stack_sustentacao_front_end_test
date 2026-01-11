import Sidebar from "@/components/partials/sidebar/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="grid grid-cols-7">
      <Sidebar />

      <div className="col-span-6">{children}</div>
    </main>
  );
}
