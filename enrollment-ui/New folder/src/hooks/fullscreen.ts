export const enterFullscreen = (element: HTMLElement | null) => {
  if (!element) return;

  if (!document.fullscreenElement) {
    element.requestFullscreen();
  }
};

export const exitFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
};

export const toggleFullscreen = (element: HTMLElement | null) => {
  if (!element) return;

  if (!document.fullscreenElement) {
    element.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};
