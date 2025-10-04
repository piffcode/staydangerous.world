'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import feather from 'feather-icons';

import '@/styles/start.css';

const serviceOptions = [
  { value: 'Brand Strategy', label: 'Brand Strategy' },
  { value: 'Life/Mindset Coaching', label: 'Life/Mindset Coaching' },
  { value: 'Business Coaching', label: 'Business Coaching for Artists/Creatives' },
  { value: 'Creative Direction', label: 'Creative Direction' },
  { value: 'Production', label: 'Production' },
  { value: 'Songwriting', label: 'Songwriting' },
  { value: 'Merchandising', label: 'Merchandising' },
  { value: 'Website Building', label: 'Website Building' },
];

export default function StartPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    feather.replace();

    const canvas = document.getElementById('particleCanvas') as HTMLCanvasElement | null;
    const ctx = canvas?.getContext('2d') ?? null;
    const loadingScreen = document.getElementById('loadingScreen');
    const bgVideo = document.getElementById('bgVideo') as HTMLVideoElement | null;
    const soundToggle = document.getElementById('soundToggle');
    const particleToggle = document.getElementById('particleToggle');
    const greetingText = document.getElementById('greetingText');
    const timeDisplay = document.getElementById('currentTime');
    const cursor = document.getElementById('customCursor');
    const navLinks = Array.from(document.querySelectorAll<HTMLElement>('.nav-link'));

    let particlesEnabled = true;
    let particleAnimation: number | null = null;
    let cursorAnimation: number | null = null;
    let trailTimeout: ReturnType<typeof setTimeout> | null = null;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];
    const cleanupFns: Array<() => void> = [];

    if (canvas && ctx) {
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      class Particle {
        x = 0;
        y = 0;
        vx = 0;
        vy = 0;
        size = 0;
        alpha = 0;

        constructor() {
          this.reset();
        }

        reset() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = (Math.random() - 0.5) * 0.5;
          this.size = Math.random() * 2;
          this.alpha = Math.random() * 0.5;
        }

        update() {
          this.x += this.vx;
          this.y += this.vy;
          if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
          }
        }

        draw() {
          ctx.fillStyle = `rgba(255, 0, 0, ${this.alpha})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      let particles: Particle[] = [];

      const initParticles = () => {
        particles = Array.from({ length: 100 }, () => new Particle());
      };

      const animateParticles = () => {
        if (!particlesEnabled) {
          particleAnimation = null;
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((particle) => {
          particle.update();
          particle.draw();
        });
        particleAnimation = window.requestAnimationFrame(animateParticles);
      };

      resizeCanvas();
      initParticles();
      animateParticles();

      const handleResize = () => {
        resizeCanvas();
        initParticles();
      };

      window.addEventListener('resize', handleResize);
      cleanupFns.push(() => window.removeEventListener('resize', handleResize));

      if (particleToggle) {
        const icon = particleToggle.querySelector('i');

        const updateIcon = () => {
          if (icon) {
            icon.setAttribute('data-feather', particlesEnabled ? 'zap' : 'zap-off');
            feather.replace();
          }
        };

        const handleParticleToggle = () => {
          particlesEnabled = !particlesEnabled;
          if (!particlesEnabled) {
            if (particleAnimation !== null) {
              window.cancelAnimationFrame(particleAnimation);
              particleAnimation = null;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          } else if (particleAnimation === null) {
            animateParticles();
          }
          updateIcon();
        };

        particleToggle.addEventListener('click', handleParticleToggle);
        cleanupFns.push(() => particleToggle.removeEventListener('click', handleParticleToggle));
      }

      cleanupFns.push(() => {
        if (particleAnimation !== null) {
          window.cancelAnimationFrame(particleAnimation);
        }
      });
    }

    if (loadingScreen) {
      timeouts.push(window.setTimeout(() => loadingScreen.classList.add('hidden'), 2200));
    }

    if (bgVideo && soundToggle) {
      bgVideo.muted = true;
      const icon = soundToggle.querySelector('i');

      const updateIcon = () => {
        if (icon) {
          icon.setAttribute('data-feather', bgVideo.muted ? 'volume-x' : 'volume-2');
          feather.replace();
        }
      };

      const handleSoundToggle = () => {
        bgVideo.muted = !bgVideo.muted;
        updateIcon();
      };

      soundToggle.addEventListener('click', handleSoundToggle);
      cleanupFns.push(() => soundToggle.removeEventListener('click', handleSoundToggle));
      updateIcon();
    }

    if (greetingText && timeDisplay) {
      const updateTime = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');

        timeDisplay.textContent = `${hours}:${minutes}`;

        let greeting = 'Good evening';
        if (hours < 12) greeting = 'Good morning';
        else if (hours < 18) greeting = 'Good afternoon';
        greetingText.textContent = greeting;
      };

      updateTime();
      intervals.push(window.setInterval(updateTime, 60000));
    }

    if (cursor) {
      let mouseX = 0;
      let mouseY = 0;
      let cursorX = 0;
      let cursorY = 0;

      const updateCursor = () => {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        cursorAnimation = window.requestAnimationFrame(updateCursor);
      };

      const handleMouseMove = (event: MouseEvent) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        cursor.classList.add('active');

        if (bgVideo) {
          const moveX = (event.clientX / window.innerWidth - 0.5) * 20;
          const moveY = (event.clientY / window.innerHeight - 0.5) * 20;
          bgVideo.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(1.1)`;
        }

        if (trailTimeout) {
          window.clearTimeout(trailTimeout);
        }

        trailTimeout = window.setTimeout(() => {
          const trail = document.createElement('div');
          trail.className = 'trail';
          trail.style.left = `${event.clientX}px`;
          trail.style.top = `${event.clientY}px`;
          document.body.appendChild(trail);
          timeouts.push(window.setTimeout(() => {
            trail.remove();
          }, 450));
        }, 40);
      };

      document.addEventListener('mousemove', handleMouseMove);
      cleanupFns.push(() => document.removeEventListener('mousemove', handleMouseMove));

      updateCursor();
      cleanupFns.push(() => {
        if (cursorAnimation !== null) {
          window.cancelAnimationFrame(cursorAnimation);
        }
      });

      navLinks.forEach((link) => {
        const element = link;
        const handleMouseEnter = () => cursor.classList.add('hover');
        const handleMouseLeave = () => {
          cursor.classList.remove('hover');
          element.style.transform = 'translate(0, 0)';
        };
        const handleLinkMove = (event: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const x = event.clientX - rect.left - rect.width / 2;
          const y = event.clientY - rect.top - rect.height / 2;
          element.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
        };

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('mousemove', handleLinkMove);

        cleanupFns.push(() => {
          element.removeEventListener('mouseenter', handleMouseEnter);
          element.removeEventListener('mouseleave', handleMouseLeave);
          element.removeEventListener('mousemove', handleLinkMove);
        });
      });
    }

    const handleKeydown = (event: KeyboardEvent) => {
      const number = parseInt(event.key, 10);
      if (!Number.isNaN(number) && number > 0 && number <= navLinks.length) {
        const link = navLinks[number - 1];
        if (link instanceof HTMLElement) {
          link.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    cleanupFns.push(() => document.removeEventListener('keydown', handleKeydown));

    return () => {
      cleanupFns.forEach((fn) => fn());
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      intervals.forEach((intervalId) => window.clearInterval(intervalId));
      if (trailTimeout) {
        window.clearTimeout(trailTimeout);
      }
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    setIsSubmitting(true);
    setStatus('idle');
    setStatusMessage(null);

    try {
      const formData = new FormData(form);
      const payload = new URLSearchParams();

      formData.forEach((value, key) => {
        if (typeof value === 'string') {
          payload.append(key, value);
        }
      });

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString(),
      });

      let data: unknown;

      try {
        data = await response.json();
      } catch (error) {
        data = null;
      }

      const isSuccessResponse =
        response.ok &&
        data !== null &&
        typeof data === 'object' &&
        'ok' in data &&
        typeof (data as { ok?: unknown }).ok === 'boolean' &&
        Boolean((data as { ok: boolean }).ok);

      if (!isSuccessResponse) {
        const errorMessage =
          data &&
          typeof data === 'object' &&
          'error' in data &&
          typeof (data as { error?: unknown }).error === 'string'
            ? (data as { error: string }).error
            : 'Something went wrong. Please try again.';

        throw new Error(errorMessage);
      }

      form.reset();
      setStatus('success');
      setStatusMessage('Thanks! Your inquiry has been received.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to submit your inquiry. Please try again.';
      setStatus('error');
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div id="loadingScreen" className="loading-screen">
        <div className="loader-text">Stay Dangerous Productions</div>
        <div className="loader-bar">
          <div className="loader-progress"></div>
        </div>
      </div>
      <canvas id="particleCanvas"></canvas>
      <div className="video-container">
        <div className="video-overlay"></div>
        <video id="bgVideo" autoPlay muted loop playsInline>
          <source src="https://static.photos/urban/1200x630/42" type="video/mp4" />
        </video>
      </div>
      <Link href="/" className="logo">
        STAY DANGEROUS
      </Link>
      <div className="greeting">
        <span id="greetingText">Good evening</span>
        <span id="currentTime" className="time-display">
          00:00
        </span>
      </div>
      <main className="content-wrapper">
        <div className="contact-card">
          <div className="contact-info">
            <h1 className="glitch-wrapper">
              <span className="glitch-text" data-text="Start Your Project">
                Start Your Project
              </span>
            </h1>
            <p>
              Tell us about your vision. We design strategies, stories, and experiences that cut through the noise and move
              culture forward. Drop the details and we’ll get back with next steps.
            </p>
            <span className="tagline">Creative production &amp; artist development</span>
          </div>
          <form
            method="POST"
            action="/api/contact"
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-lg border border-red-500/40 bg-black/60 px-4 py-3 text-red-100 placeholder-red-500/60 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-red-500/40 bg-black/60 px-4 py-3 text-red-100 placeholder-red-500/60 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <input type="text" name="company" id="company" className="hidden" tabIndex={-1} autoComplete="off" />
            <div className="space-y-2">
              <label htmlFor="service" className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
                Service
              </label>
              <select
                id="service"
                name="service"
                required
                className="w-full rounded-lg border border-red-500/40 bg-black/60 px-4 py-3 text-red-100 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a service
                </option>
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="project" className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
                Tell us about your project
              </label>
              <textarea
                id="project"
                name="project"
                rows={5}
                required
                className="w-full rounded-lg border border-red-500/40 bg-black/60 px-4 py-3 text-red-100 placeholder-red-500/60 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Share the vision, scope, and any collaborators."
              ></textarea>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="budget" className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
                  Budget
                </label>
                <input
                  id="budget"
                  name="budget"
                  type="text"
                  required
                  className="w-full rounded-lg border border-red-500/40 bg-black/60 px-4 py-3 text-red-100 placeholder-red-500/60 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Approximate budget"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="timeline" className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
                  Timeline
                </label>
                <input
                  id="timeline"
                  name="timeline"
                  type="text"
                  required
                  className="w-full rounded-lg border border-red-500/40 bg-black/60 px-4 py-3 text-red-100 placeholder-red-500/60 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="When do you want to begin?"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="success" className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
                What does success look like?
              </label>
              <textarea
                id="success"
                name="success"
                rows={4}
                required
                className="w-full rounded-lg border border-red-500/40 bg-black/60 px-4 py-3 text-red-100 placeholder-red-500/60 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Describe the outcomes you want to achieve."
              ></textarea>
            </div>
            {statusMessage && (
              <p
                className={`text-sm ${status === 'error' ? 'text-red-300' : 'text-green-400'}`}
                role="status"
                aria-live="polite"
              >
                {statusMessage}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-red-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending…' : 'Submit Inquiry'}
            </button>
          </form>
        </div>
      </main>
      <nav className="floating-nav">
        <Link href="/" className="nav-link">
          <div className="nav-number">01</div>
          <div className="glitch-wrapper">
            <span className="glitch-text" data-text="Home">
              Home
            </span>
          </div>
          <div className="gradient-line"></div>
        </Link>
        <Link href="/work" className="nav-link">
          <div className="nav-number">02</div>
          <div className="glitch-wrapper">
            <span className="glitch-text" data-text="Work">
              Work
            </span>
          </div>
          <div className="gradient-line"></div>
        </Link>
        <Link href="/services" className="nav-link">
          <div className="nav-number">03</div>
          <div className="glitch-wrapper">
            <span className="glitch-text" data-text="Services">
              Services
            </span>
          </div>
          <div className="gradient-line"></div>
        </Link>
        <Link href="/start" className="nav-link active">
          <div className="nav-number">04</div>
          <div className="glitch-wrapper">
            <span className="glitch-text" data-text="Start">
              Start
            </span>
          </div>
          <div className="gradient-line"></div>
        </Link>
      </nav>
      <div className="control-panel">
        <button id="soundToggle" className="control-btn" type="button" aria-label="Toggle sound">
          <i data-feather="volume-x"></i>
        </button>
        <button id="particleToggle" className="control-btn" type="button" aria-label="Toggle particles">
          <i data-feather="zap"></i>
        </button>
      </div>
      <div id="customCursor" className="custom-cursor"></div>
    </>
  );
}
