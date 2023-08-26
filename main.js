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

  // todo - handle external stop
  await on(video, "click");

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

  const recordings = await dir.getFileHandle('recs', {create: true});

  const file = await recordings.getFileHandle(`rec-${new Date().toISOString()}.webm`, {create: true});

  const writer = await file.createWritable();

  await writer.write(blob)

  await writable.close();

  console.log("closed")
}

function Loop() {
  Run()
    .catch((e) => {
      video.remove();

      document.body.appendChild(error);

      error.innerText = e;
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

  const recordings = await dir.getDirectoryHandle('recs', {create: true});

  console.log(recordings)

  for await(const file of recordings) {

    const li = document.createElement('li')
    li.innerText = 'Recording! ' + file.name 
    recordingList.append(li)
  }
}


initFS();