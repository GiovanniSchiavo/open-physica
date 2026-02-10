import { cn } from "@/lib/utils";

interface VideoProps {
  id: string;
  title?: string;
  startTime?: string | number;
  endTime?: string | number;
  className?: string;
}

export function Video({
  id,
  title = "YouTube video player",
  startTime,
  endTime,
  className,
}: VideoProps) {
  const params = new URLSearchParams({
    rel: "0",
    autoplay: "0",
    iv_load_policy: "3",
  });

  if (startTime) {
    const seconds = convertTimeToSeconds(startTime);
    params.set("start", seconds);
  }

  if (endTime) {
    const seconds = convertTimeToSeconds(endTime);
    params.set("end", seconds);
  }

  const src = `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;

  return (
    <div
      className={cn(
        "my-6 aspect-video w-full overflow-hidden rounded-lg",
        className,
      )}
    >
      <iframe
        className="size-full"
        src={src}
        title={title}
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function convertTimeToSeconds(time: string | number): string {
  if (typeof time === "number") return time.toString();
  return time
    .split(":")
    .reverse()
    .reduce((acc, segment, index) => acc + +segment * 60 ** index, 0)
    .toString();
}
