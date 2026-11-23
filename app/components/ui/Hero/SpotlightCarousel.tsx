import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { Spotlight } from "models/Strapi";
import { Button } from "../inline/Button/Button";
import heroStyles from "./Hero.module.scss";
import styles from "./SpotlightCarousel.module.scss";

const ROTATE_MS = 15000;
const SWIPE_PX = 50;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * The homepage hero, showing one spotlight at a time, with a card for each.
 */
export const SpotlightCarousel = ({
  spotlights,
}: {
  spotlights: Spotlight[];
}) => {
  const [index, setIndex] = useState(0);
  // Paused by the Pause button or by keyboard focus, until the visitor
  // selects Play. The pointer pauses rotation only while it is over the
  // carousel.
  const [paused, setPaused] = useState(prefersReducedMotion);
  const [hovered, setHovered] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const count = spotlights.length;
  const active = Math.min(index, count - 1);
  const current = spotlights[active];
  const rotating = count > 1 && !paused && !hovered;

  useEffect(() => {
    if (!rotating) return undefined;
    const timer = window.setTimeout(
      () => setIndex((active + 1) % count),
      ROTATE_MS
    );
    return () => window.clearTimeout(timer);
  }, [rotating, active, count]);

  const show = (next: number) => setIndex((next + count) % count);

  const onFocus = (event: React.FocusEvent) => {
    const enteredFromOutside = !event.currentTarget.contains(
      event.relatedTarget as Node | null
    );
    if (
      enteredFromOutside &&
      (event.target as HTMLElement).matches(":focus-visible")
    ) {
      setPaused(true);
    }
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = event.changedTouches[0].clientX - touchStart.current.x;
    const dy = event.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      show(active + (dx < 0 ? 1 : -1));
    }
  };

  const image = (current.image?.data?.attributes?.url ?? "").replace(
    /["\\\n]/g,
    encodeURIComponent
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the handlers only pause rotation
    <section
      className={styles.carousel}
      aria-roledescription="carousel"
      aria-label="Spotlights"
      onPointerEnter={(e) => setHovered(e.pointerType === "mouse")}
      onPointerLeave={() => setHovered(false)}
      onFocus={onFocus}
      data-testid="spotlight-carousel"
    >
      <div
        className={classNames(heroStyles.hero, styles.hero)}
        style={{ backgroundImage: `url("${image}")` }}
        onTouchStart={(e) => {
          touchStart.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          };
        }}
        onTouchEnd={onTouchEnd}
      >
        {/* Every slide is rendered in the same place, so the hero is as tall
            as the tallest one and keeps its height when the slide changes. */}
        <div
          className={classNames(
            heroStyles.contentCard,
            styles.contentCard,
            styles.slides
          )}
          aria-live={rotating ? "off" : "polite"}
        >
          {spotlights.map((spotlight, i) => (
            <div
              key={spotlight.slug}
              className={classNames(heroStyles.content, styles.content, {
                [styles.hiddenSlide]: i !== active,
              })}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== active}
              role="group"
            >
              <h2 className={classNames(heroStyles.title, styles.title)}>
                {spotlight.title}
              </h2>
              {spotlight.short_description && (
                <p className={heroStyles.description}>
                  {spotlight.short_description}
                </p>
              )}
              <div className={heroStyles.buttons}>
                <Button
                  variant="primary"
                  size="lg"
                  arrowVariant="after"
                  href={`/spotlights/${spotlight.slug}`}
                >
                  Learn more
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        {count > 1 && (
          <div className={styles.cardsRow}>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => show(active - 1)}
              aria-label="Previous spotlight"
            >
              <span className="fas fa-chevron-left" aria-hidden="true" />
            </button>
            <ul className={styles.cards}>
              {spotlights.map((spotlight, i) => (
                <li key={spotlight.slug}>
                  <button
                    type="button"
                    className={classNames(styles.card, {
                      [styles.cardActive]: i === active,
                    })}
                    onClick={() => show(i)}
                    aria-current={i === active ? "true" : undefined}
                  >
                    {spotlight.image?.data?.attributes?.url && (
                      <img
                        className={styles.cardImage}
                        src={spotlight.image.data.attributes.url}
                        alt=""
                      />
                    )}
                    <span className={styles.cardTitle}>{spotlight.title}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => show(active + 1)}
              aria-label="Next spotlight"
            >
              <span className="fas fa-chevron-right" aria-hidden="true" />
            </button>
          </div>
        )}
        <div className={styles.footer}>
          {count > 1 ? (
            <button
              type="button"
              className={styles.pause}
              onClick={() => setPaused((p) => !p)}
            >
              <span
                className={`fas ${paused ? "fa-play" : "fa-pause"}`}
                aria-hidden="true"
              />
              {paused ? "Play" : "Pause"}
            </button>
          ) : (
            <span />
          )}
          <Link to="/spotlights" className={styles.seeAll}>
            See all spotlights
            <span className="fas fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};
