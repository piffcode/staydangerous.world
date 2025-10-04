'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import feather from 'feather-icons';

import '@/styles/work.css';

const workItems = [
  {
    index: 0,
    videoSrc: 'https://cdn.coverr.co/videos/coverr-young-woman-singing-while-guy-plays-guitar-0817/1080p.mp4',
    meta: ['Campaign', 'Client: NOVA', '2024'],
    title: 'NO APOLOGIES',
    description:
      'High-energy launch visuals for NOVA’s latest streetwear drop. We blended projection mapping, live performance, and kinetic typography to amplify their rebel spirit.',
    tags: ['Creative Direction', 'Production', 'Brand Strategy'],
  },
  {
    index: 1,
    videoSrc: 'https://cdn.coverr.co/videos/coverr-dancer-in-led-lights-3108/1080p.mp4',
    meta: ['Music Video', 'Artist: ZAYA', '2023'],
    title: 'GRAVITY',
    description:
      'A neon-drenched performance piece with cyberpunk choreography and world-building visuals. Shot in one night across five custom sets.',
    tags: ['Production', 'Creative Direction', 'Post'],
  },
  {
    index: 2,
    videoSrc: 'https://cdn.coverr.co/videos/coverr-creative-team-in-studio-2753/1080p.mp4',
    meta: ['Doc Short', 'Client: Roots & Rhythm', '2023'],
    title: 'ORIGIN STORIES',
    description:
      'A micro-documentary series elevating unheard voices in the creative community. Story development, direction, and post from concept to delivery.',
    tags: ['Story Development', 'Production', 'Editing'],
  },
];

export default function WorkPage() {
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
    const workFeed = document.getElementById('workFeed');
    const indicatorDots = Array.from(document.querySelectorAll<HTMLElement>('.indicator-dot'));
    const scrollIndicator = document.getElementById('scrollIndicator');

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

    const workCards = Array.from(document.querySelectorAll<HTMLElement>('.work-card'));
    if (workFeed && workCards.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const indexAttr = entry.target.getAttribute('data-index');
            const index = indexAttr ? Number.parseInt(indexAttr, 10) : -1;
            const video = entry.target.querySelector('video') as HTMLVideoElement | null;

            if (entry.isIntersecting && entry.intersectionRatio > 0.65) {
              if (video) {
                void video.play().catch(() => undefined);
              }
              indicatorDots.forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === index);
              });
            } else if (video) {
              video.pause();
            }
          });
        },
        { threshold: [0.3, 0.65, 0.9] },
      );

      workCards.forEach((card) => observer.observe(card));
      cleanupFns.push(() => observer.disconnect());

      const handleScroll = () => {
        if (scrollIndicator) {
          scrollIndicator.style.opacity = workFeed.scrollTop > 60 ? '0' : '1';
        }
      };

      workFeed.addEventListener('scroll', handleScroll);
      cleanupFns.push(() => workFeed.removeEventListener('scroll', handleScroll));
    }

    return () => {
      cleanupFns.forEach((fn) => fn());
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      intervals.forEach((intervalId) => window.clearInterval(intervalId));
      if (trailTimeout) {
        window.clearTimeout(trailTimeout);
      }
    };
  }, []);

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
      <main>
        <div className="feed-wrapper" id="workFeed">
          <div className="scroll-indicator" id="scrollIndicator">
            <i data-feather="chevrons-down"></i>
            <div className="indicator-dot"></div>
            <div className="indicator-dot"></div>
            <div className="indicator-dot"></div>
            <span>Scroll</span>
          </div>
          {workItems.map((item) => (
            <section key={item.index} className="work-card" data-index={item.index}>
              <video className="work-media" playsInline muted loop>
                <source src={item.videoSrc} type="video/mp4" />
              </video>
              <div className="work-overlay"></div>
              <div className="work-info">
                <div className="work-meta">
                  {item.meta.map((meta) => (
                    <span key={meta}>{meta}</span>
                  ))}
                </div>
                <h2>{item.title}</h2>
                <p className="work-description">{item.description}</p>
                <div className="work-tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="work-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          ))}
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
        <Link href="/work" className="nav-link active">
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
        <Link href="/start" className="nav-link">
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
