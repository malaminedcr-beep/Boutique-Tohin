'use client';

import { useEffect } from 'react';

export default function CustomCursor() {
  useEffect(() => {
    const dot = document.getElementById('custom-cursor-dot');
    const ring = document.getElementById('custom-cursor-ring');
    const links = Array.from(document.querySelectorAll('a, button'));
    let mouseX = 0;
    let mouseY = 0;

    const updatePosition = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (dot) {
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
      }
      if (ring) {
        ring.style.left = `${mouseX}px`;
        ring.style.top = `${mouseY}px`;
      }
    };

    const addHover = () => document.body.classList.add('cursor-hover');
    const removeHover = () => document.body.classList.remove('cursor-hover');

    window.addEventListener('mousemove', updatePosition);
    links.forEach((node) => {
      node.addEventListener('mouseenter', addHover);
      node.addEventListener('mouseleave', removeHover);
    });

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      links.forEach((node) => {
        node.removeEventListener('mouseenter', addHover);
        node.removeEventListener('mouseleave', removeHover);
      });
    };
  }, []);

  return (
    <>
      <div id="custom-cursor-ring" aria-hidden="true" />
      <div id="custom-cursor-dot" aria-hidden="true" />
    </>
  );
}
