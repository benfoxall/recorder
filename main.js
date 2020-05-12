console.log("MAIN!");

const record = document.querySelector("#record");

const start = async () => {
  try {
    const media = await navigator.mediaDevices.getDisplayMedia({
      audio: false,
    });

    var options = { mimeType: "video/webm; codecs=vp9" };
    const mediaRecorder = new MediaRecorder(media, options);

    const finish = new Promise((resolve, reject) => {
      const chunks = [];

      mediaRecorder.onerror = reject;

      mediaRecorder.ondataavailable = (event) => chunks.push(event.data);

      mediaRecorder.onstop = (e) =>
        resolve(new Blob(chunks, { type: "video/webm" }));
    });

    mediaRecorder.start(1000);

    setTimeout(() => {
      console.log("stopping");
      mediaRecorder.stop();
    }, 3000);

    const blob = await finish;

    var url = URL.createObjectURL(blob);

    const video = document.createElement("video");
    video.src = url;
    video.controls = true;

    document.body.appendChild(video);
  } catch (e) {
    console.error(e);
  }
};

record.addEventListener("click", start);
