import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Red-Black Tree Visualizer",
  description:
    "Step-by-step visualization of operations (insertions, deletions, and rotations) of a self-balancing red-black tree. Project work of DSA (4th semester) at Tribhuvan University, Institute of Engineering, Pulchowk Campus.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}
