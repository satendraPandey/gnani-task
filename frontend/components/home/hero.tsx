import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, Upload } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-[calc(100vh-80px)] px-6 py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center">

        {/* Hero text */}
        <div className="max-w-3xl text-center">
          <p className="mb-5 text-sm font-medium text-muted-foreground">
            AI-powered audio transcription
          </p>

          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Turn your audio into
            <span className="block">
              accurate text with AI
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
            Upload your audio and get accurate transcripts and
            AI-generated summaries in one place.
          </p>
        </div>

        {/* Upload workspace */}
        <div className="mt-14 w-full max-w-3xl">

          {/* Upload box */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-3">
            <div
              className="
                flex min-h-[300px]
                flex-col items-center justify-center
                rounded-2xl
                border border-dashed border-white/15
                px-6 py-12
                text-center
                transition-colors
                hover:border-white/30
              "
            >

              {/* Microphone icon */}
              <div
                className="
                  flex h-16 w-16
                  items-center justify-center
                  rounded-2xl
                  border border-white/10
                  bg-white/[0.04]
                "
              >
                <Mic className="h-8 w-8 text-white/80" />
              </div>

              {/* Heading */}
              <h2 className="mt-6 text-xl font-medium">
                Drop your audio here
              </h2>

              {/* Description */}
              <p className="mt-2 text-sm text-muted-foreground">
                Drag and drop your file or choose one from your computer
              </p>

              {/* Choose Audio */}
              <Button
                size="lg"
                className="mt-7 rounded-full px-7"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Audio
              </Button>

              {/* Supported formats */}
              <p className="mt-4 text-xs text-muted-foreground">
                MP3 · WAV · OGG · FLAC · AAC · M4A
              </p>
            </div>
          </div>

          {/* Language */}
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <label className="mb-3 block text-sm font-medium">
              Language
            </label>

            <Select>
              <SelectTrigger
                className="
                  h-11 w-full
                  rounded-xl
                  border-white/10
                  bg-white/[0.03]
                "
              >
                <SelectValue placeholder="Select language" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="en-IN">
                  English
                </SelectItem>

                <SelectItem value="hi-IN">
                  Hindi
                </SelectItem>

                <SelectItem value="bn-IN">
                  Bengali
                </SelectItem>

                <SelectItem value="gu-IN">
                  Gujarati
                </SelectItem>

                <SelectItem value="kn-IN">
                  Kannada
                </SelectItem>

                <SelectItem value="ml-IN">
                  Malayalam
                </SelectItem>

                <SelectItem value="mr-IN">
                  Marathi
                </SelectItem>

                <SelectItem value="pa-IN">
                  Punjabi
                </SelectItem>

                <SelectItem value="ta-IN">
                  Tamil
                </SelectItem>

                <SelectItem value="te-IN">
                  Telugu
                </SelectItem>
              </SelectContent>
            </Select>

            <p className="mt-2 text-xs text-muted-foreground">
              Select the language spoken in your audio
            </p>
          </div>

          {/* CTA */}
          <div className="mt-7 flex justify-center">
            <Button
              size="lg"
              className="rounded-full px-8"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Get Started
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;