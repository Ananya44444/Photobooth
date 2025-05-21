document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const video = $('video'), canvas = $('canvas'), strip = $('strip-canvas');
  const preview = $('photo-preview'), uploadPreview = $('preview-container'), fileInput = $('file-input');
  const camBox = $('camera-container'), uploadBox = $('upload-container'), stripBox = $('strip-container');
  const btns = {
    cam: $('cameraBtn'), upload: $('uploadBtn'), capture: $('capture-btn'),
    closeCam: $('close-camera-btn'), closeUpload: $('close-upload-btn'),
    save: $('save-strip-btn'), retake: $('retake-strip-btn')
  };

  let photos = [], index = 0, stream = null;

  function resetPreview() {
    photos = []; index = 0; preview.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const frame = document.createElement('div');
      frame.className = 'empty-frame'; frame.id = `frame-${i}`;
      preview.appendChild(frame);
    }
  }

  function updateFrame(src, i) {
    const img = new Image(); img.src = src; img.width = 120; img.height = 120;
    $(`frame-${i}`)?.replaceWith(img);
  }

  function createStrip() {
    const ctx = strip.getContext('2d'), w = 300, h = 200;
    strip.width = w; strip.height = h * 3;
    photos.forEach((src, i) => {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, i * h, w, h);
      img.src = src;
    });
    camBox.classList.add('hidden');
    uploadBox.classList.add('hidden');
    stripBox.classList.remove('hidden');
  }

  function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true }).then(s => {
      stream = s; video.srcObject = s;
      camBox.classList.remove('hidden');
      uploadBox.classList.add('hidden');
      stripBox.classList.add('hidden');
      resetPreview();
    });
  }

  function takePhoto() {
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const data = canvas.toDataURL('image/jpeg');
    photos.push(data); updateFrame(data, index++);
    if (index === 3) createStrip();
  }

  function handleUpload(files) {
    const selected = [...files].slice(0, 3);
    if (selected.length !== 3) return alert("Select 3 images");
    photos = []; uploadPreview.innerHTML = '';
    let loaded = 0;
    selected.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = e => {
        const src = e.target.result;
        photos[i] = src;
        const img = new Image(); img.src = src; img.style.width = '120px';
        uploadPreview.appendChild(img);
        if (++loaded === 3) createStrip();
      };
      reader.readAsDataURL(file);
    });
  }

  function stopCamera() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = null;
  }

  btns.cam.onclick = startCamera;
  btns.capture.onclick = () => index < 3 && takePhoto();
  btns.closeCam.onclick = () => { stopCamera(); camBox.classList.add('hidden'); };
  btns.upload.onclick = () => {
    stopCamera();
    camBox.classList.add('hidden');
    stripBox.classList.add('hidden');
    uploadBox.classList.remove('hidden');
    uploadPreview.innerHTML = '';
    fileInput.value = '';
  };
  btns.closeUpload.onclick = () => uploadBox.classList.add('hidden');
  btns.save.onclick = () => {
    const link = document.createElement('a');
    link.href = strip.toDataURL('image/jpeg'); link.download = 'strip.jpg'; link.click();
  };
  btns.retake.onclick = () => {
    stripBox.classList.add('hidden');
    camBox.classList.remove('hidden');
    resetPreview();
  };
  fileInput.onchange = e => handleUpload(e.target.files);
});