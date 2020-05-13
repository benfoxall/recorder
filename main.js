const button = document.querySelector("button");

const link = document.createElement("a");
const video = document.createElement("video");
const error = document.createElement("output");

async function start() {
  await click(button);

  const stream = await navigator.mediaDevices.getDisplayMedia({
    audio: false,
    video: true,
  });

  video.autoplay = true;
  video.srcObject = stream;
  document.body.appendChild(video);

  var options = { mimeType: "video/webm; codecs=vp9" };

  const recorder = new MediaRecorder(stream, options);

  // Also record the video
  const chunks = [];
  recorder.ondataavailable = (event) => chunks.push(event.data);

  const finish = new Promise((resolve) => (recorder.onstop = resolve));

  recorder.start();

  await click(video);

  console.log("stopping");

  video.pause();
  recorder.stop();
  stream.getTracks().forEach((track) => track.stop());

  await finish;

  const blob = new Blob(chunks, {
    type: "video/webm",
  });

  if (link.href) {
    URL.revokeObjectURL(link.href);
  }

  link.href = URL.createObjectURL(blob);
  link.download = "capture.webm";

  document.body.append(link);
  link.append(video);

  video.pause();
}

(async () => {
  try {
    error.remove();

    await start();
  } catch (e) {
    video.remove();

    document.body.appendChild(error);

    error.innerText = e;
  }
})();

function click(element) {
  return new Promise((resolve) =>
    element.addEventListener("click", function handle(e) {
      element.removeEventListener("click", handle);
      resolve(e);
    })
  );
}
