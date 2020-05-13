const video = document.createElement("video");
video.autoplay = true;

const a = document.createElement("a");

async function start() {
  await click(document.querySelector("#record"));

  const stream = await navigator.mediaDevices.getDisplayMedia({
    audio: false,
    video: true,
  });

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

  var url = URL.createObjectURL(blob);
  a.href = url;
  a.download = "capture.webm";
  a.appendChild(video);

  document.body.append(a);

  video.className = "sub";
  video.pause();
}

(async () => {
  try {
    await start();
    video.remove();
  } catch (e) {
    const output = document.createElement("output");
    output.className = "err";
    document.body.appendChild(output);

    output.innerText = e;
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
