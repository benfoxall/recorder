const button = document.querySelector("button");

const link = document.createElement("a");
const video = document.createElement("video");
const error = document.createElement("output");
const recordingList = document.createElement("ol");
document.body.appendChild(recordingList)

const mediaConstaints = { audio: false, video: true };
const recorderConstraints = { mimeType: "video/webm; codecs=vp9" };
const blobOpts = { type: "video/webm" };

Loop();

async function Run() {
  await on(button, "click");

  error.remove();

  const filename = fname(new Date, 'webm');

  const stream = await navigator.mediaDevices.getDisplayMedia(mediaConstaints);

  video.autoplay = true;
  video.srcObject = stream;
  document.body.appendChild(video);

  const recorder = new MediaRecorder(stream, recorderConstraints);

  // Also record the video
  const chunks = [];
  recorder.ondataavailable = (event) => chunks.push(event.data);

  const finish = new Promise((resolve) => (recorder.onstop = resolve));

  recorder.start();

  const trackEnded = new Promise(ended => {
    for (const track of stream.getTracks()) {
      track.addEventListener("ended", ended)
    }
  })
  const videoClicked = on(video, "click");

  await Promise.race([videoClicked, trackEnded])

  video.pause();
  recorder.stop();
  stream.getTracks().forEach((track) => track.stop());

  await finish;

  const blob = new Blob(chunks, blobOpts);

  if (link.href) {
    URL.revokeObjectURL(link.href);
  }

  link.href = URL.createObjectURL(blob);
  link.download = "Recording.webm";

  document.body.append(link);
  link.append(video);

  video.pause();

  const dir = await navigator.storage.getDirectory()

  const recordings = await dir.getDirectoryHandle('recs', { create: true });

  const file = await recordings.getFileHandle(filename, { create: true });

  const writer = await file.createWritable();

  await writer.write(blob)

  await writer.close();
}

function Loop() {
  Run()
    .catch((e) => {
      video.remove();

      document.body.appendChild(error);

      error.innerText = e;

      console.error(e)
    })
    .then(Loop);
}

function on(element, event) {
  return new Promise((resolve) =>
    element.addEventListener(event, function handle(e) {
      element.removeEventListener(event, handle);
      resolve(e);
    })
  );
}


async function initFS() {
  console.log("Origin File ")
  const dir = await navigator.storage.getDirectory()

  const recordings = await dir.getDirectoryHandle('recs', { create: true });

  const list = [];
  for await (const [name] of recordings) list.push(name)
  list.sort().reverse()


  for await (const name of list) {
    const li = document.createElement('li')

    const handle = await recordings.getFileHandle(name, {})
    const file = await handle.getFile()
    li.innerText = name

    const v = document.createElement('video')
    v.autoplay = true
    v.loop = true
    v.controls = true
    v.muted = true
    v.src = URL.createObjectURL(file)

    li.appendChild(v)
    recordingList.append(li)
  }
}


initFS();

function fname(date = new Date(), ext) {
  const y = date.getFullYear()
  const m = date.getMonth()
  const d = date.getDate()

  const h = date.getHours()
  const mi = date.getMinutes()
  const s = date.getSeconds()

  return `Recording ${y}-${f(m)}-${f(d)} at ${f(h)}.${f(mi)}.${f(s)}.${ext}`

  function f(s) { return s.toString().padStart(2, '0') }
}