import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ROWS = [
  { uk: "UK 6", eu: "EU 40", us: "US 7", cm: "25.0 cm" },
  { uk: "UK 7", eu: "EU 41", us: "US 8", cm: "25.7 cm" },
  { uk: "UK 8", eu: "EU 42", us: "US 9", cm: "26.5 cm" },
  { uk: "UK 9", eu: "EU 43", us: "US 10", cm: "27.3 cm" },
  { uk: "UK 10", eu: "EU 44", us: "US 11", cm: "28.0 cm" },
  { uk: "UK 11", eu: "EU 45", us: "US 12", cm: "28.8 cm" },
];

export function SizeGuide() {
  return (
    <Dialog>
      <DialogTrigger className="text-[0.6875rem] tracking-[0.14em] text-taupe uppercase underline decoration-border underline-offset-4 transition-colors hover:text-foreground">
        Size guide
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">Size guide</DialogTitle>
          <DialogDescription>
            Our lasts run true to size. Between sizes, we suggest the larger.
          </DialogDescription>
        </DialogHeader>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["UK", "EU", "US", "Foot length"].map((head) => (
                <th key={head} className="label-caps py-2 font-normal">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.uk} className="border-b border-border/60 last:border-0">
                <td className="py-2">{row.uk}</td>
                <td className="py-2 text-taupe">{row.eu}</td>
                <td className="py-2 text-taupe">{row.us}</td>
                <td className="py-2 text-taupe">{row.cm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DialogContent>
    </Dialog>
  );
}
