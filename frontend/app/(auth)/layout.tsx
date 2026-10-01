export default async function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid grid-cols-4">
      <div className="col-span-1">Sidebar</div>
      <div  className="col-span-3">{children}</div>
    </div>
  );
}
