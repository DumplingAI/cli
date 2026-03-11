---
name: dumplingai-transcripts-media
description: When the user wants a transcript, captions, spoken-text extraction, or media-to-text workflow through DumplingAI. Also use when the user mentions YouTube transcript, TikTok transcript, transcribe this video, pull captions, extract text from audio, transcript from URL, or wants to inspect the contents of a video before writing or summarizing from it. Use this whenever the job is to turn video or audio into text first. For turning a YouTube transcript into a finished article, see youtube-to-blog-post.
---

# DumplingAI Transcripts And Media

## Allowed Commands

```bash
dumplingai catalog search <prompt>
dumplingai catalog details <type> <id>
dumplingai run <type> <id> --input '<json>'
```

## Workflow

1. Convert the request into a short keyword query such as `youtube transcript`, `tiktok transcript`, or `extract video`.
2. Run `dumplingai catalog search "<job>"`.
3. Inspect the best candidate with `dumplingai catalog details <type> <id>`.
4. Execute with the media URL or supported input payload.
5. Save long transcript payloads to `.dumplingai/` and inspect only the relevant fields.
6. If the user wants a blog or newsletter draft from the transcript, hand off to `youtube-to-blog-post`.

## Search Phrases

- `youtube transcript`
- `tiktok transcript`
- `extract video`
- `transcription`
- `audio transcript`

## Output Strategy

```bash
dumplingai catalog search "youtube transcript" > .dumplingai/catalog-search.json
dumplingai catalog details capability get_youtube_transcript > .dumplingai/youtube-transcript.json
dumplingai run capability get_youtube_transcript --input '{"videoUrl":"https://youtube.com/watch?v=ID"}' > .dumplingai/transcript.json
head -80 .dumplingai/transcript.json
rg '"transcript"|"text"|"segments"|"captions"' .dumplingai/transcript.json
```
