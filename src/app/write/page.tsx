import type { Metadata } from "next";
import { Suspense } from "react";
import { WritingRoom } from "./writing-room";

export const metadata: Metadata = { title: "Write a Note" };

export default function WritePage() {
  return (
    <Suspense>
      <WritingRoom />
    </Suspense>
  );
}
