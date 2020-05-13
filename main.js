const video = document.createElement("video");
video.autoplay = true;

const a = document.createElement("a");

async function start() {
  await click(document.querySelector("#record"));

  const media = await navigator.mediaDevices.getDisplayMedia({
    audio: false,
    video: true,
  });

  video.srcObject = media;
  document.body.appendChild(video);

  var options = { mimeType: "video/webm; codecs=vp9" };
  const mediaRecorder = new MediaRecorder(media, options);

  // Also record the video
  const chunks = [];

  mediaRecorder.ondataavailable = (event) => chunks.push(event.data);

  const finish = new Promise((resolve) => (mediaRecorder.onstop = resolve));

  mediaRecorder.start();

  await click(video);

  console.log("stopping");

  mediaRecorder.stop();
  video.pause();

  // debugger;
  media.getTracks().forEach((track) => track.stop());

  await finish;

  const blob = new Blob(chunks, {
    type: "video/webm",
  });

  var url = URL.createObjectURL(blob);
  a.href = url;
  a.download = "capture.webm";
  a.appendChild(video);

  document.body.append(a);

  video.className = "sub";
  video.pause();
}

try {
  start();

  video.remove();
} catch (e) {}

function click(element) {
  return new Promise((resolve) =>
    element.addEventListener("click", function handle(e) {
      element.removeEventListener("click", handle);
      resolve(e);
    })
  );
}
