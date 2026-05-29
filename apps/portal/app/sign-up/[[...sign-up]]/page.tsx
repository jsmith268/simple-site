import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100dvh", padding: "2rem" }}>
      <SignUp />
    </div>
  );
}
