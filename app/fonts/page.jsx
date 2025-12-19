// app/fonts-example/page.jsx

import { Noto_Serif_Telugu } from "next/font/google";



import { Noto_Sans_Telugu } from "next/font/google";
const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "500", "700"],
});

const notoSerifTelugu = Noto_Serif_Telugu({
  subsets: ["telugu"],
  weight: ["400", "700"],
});
import { Suranna } from "next/font/google";
const suranna = Suranna({
  subsets: ["telugu"],
  weight: "400",
});
import { Suravaram } from "next/font/google";


const suravaram = Suravaram({
  subsets: ["telugu"],
  weight: "400",
});

import { Mallanna } from "next/font/google";
const mallanna = Mallanna({
  subsets: ["telugu"],
  weight: "400",
});

export default function TeluguFontsPage() {
  return (
    <div className="p-6 space-y-6">

      {/* Noto Sans Telugu */}
      <div className={notoSansTelugu.className}>
        <h2 className="text-lg font-bold">Noto Sans Telugu</h2>
        <p className="text-base">
          ఇవాళ పంచాంగం: తిథి, నక్షత్రం, యోగం, కరణం, రాహుకాలం.
        </p>
      </div>

      {/* Noto Serif Telugu */}
      <div className={notoSerifTelugu.className}>
        <h2 className="text-lg font-bold">Noto Serif Telugu</h2>
        <p className="text-base">
          ఇవాళ పంచాంగం: తిథి, నక్షత్రం, యోగం, కరణం, రాహుకాలం.
        </p>
      </div>

      {/* Suranna */}
      <div className={suranna.className}>
        <h2 className="text-lg font-bold">Suranna</h2>
        <p className="text-base">
          ఇవాళ పంచాంగం: తిథి, నక్షత్రం, యోగం, కరణం, రాహుకాలం.
        </p>
      </div>

      {/* Suravaram */}
      <div className={suravaram.className}>
        <h2 className="text-lg font-bold">Suravaram</h2>
        <p className="text-base">
          ఇవాళ పంచాంగం: తిథి, నక్షత్రం, యోగం, కరణం, రాహుకాలం.
        </p>
      </div>

      {/* Mallanna */}
      <div className={mallanna.className}>
        <h2 className="text-lg font-bold">Mallanna</h2>
        <p className="text-base">
          ఇవాళ పంచాంగం: తిథి, నక్షత్రం, యోగం, కరణం, రాహుకాలం.
        </p>
      </div>

    </div>
  );
}
