export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F8F5E6] sm:px-4 sm:py-6">
      {children}
    </main>
  );
}
