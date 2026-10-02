export default async function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="">
      {children}
    </div>
  );
}
