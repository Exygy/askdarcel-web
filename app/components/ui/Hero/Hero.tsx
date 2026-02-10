import React, { useState } from "react";
import classNames from "classnames";
import styles from "./Hero.module.scss";
import { Button } from "../inline/Button/Button";
import { Link } from "models/Strapi";
import {
  ArrowRightIcon,
  // ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import childcareImage from "../../../assets/img/HomePage/temp_childcare.jpg";

/**
 * Displays a hero section on the homepage
 */
const Hero = ({
  backgroundImage,
  title,
  description,
  buttons,
}: {
  backgroundImage: string;
  title: string;
  description: string;
  buttons: Link[];
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardStyles = classNames(styles.contentCard);
  return (
    <div data-testid={"hero"}>
      <div className={styles.banner}>
        <div className={styles.bannerTitle}>
          {/* <ExclamationCircleIcon width={24} height={24} color="white" /> */}
          <p>Get connected with resources during the teacher strike</p>
        </div>
        <div className={styles.linkContent}>
          <a
            href="https://www.sf.gov/departments--children-youth-and-their-families/free-youth-meals-sfusd-school-strike"
            target="_blank"
            rel="noopener noreferrer"
          >
            Free Youth Meals
            <ArrowRightIcon width={12} height={12} />
          </a>
          <a
            href="https://www.sfusd.edu/information-employees/labor-relations/negotiations-updates/negotiations-information-and-resources-families"
            target="_blank"
            rel="noopener noreferrer"
          >
            SFUSD Resources
            <ArrowRightIcon width={12} height={12} />
          </a>
          <button
            type="button"
            className={styles.modalTrigger}
            onClick={() => setIsModalOpen(true)}
          >
            Temporary Free Childcare
            <ArrowRightIcon width={12} height={12} />
          </button>
        </div>
      </div>
      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") {
              setIsModalOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close modal"
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
            >
              <XMarkIcon width={24} height={24} />
            </button>
            <img
              src={childcareImage}
              alt="Temporary child care information during the UESF strike"
              className={styles.modalImage}
            />
          </div>
        </div>
      )}
      <div
        className={styles.hero}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className={cardStyles}>
          <div className={styles.content}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
            <div className={styles.buttons}>
              {buttons.map((button, i) => (
                <Button
                  key={button.text}
                  variant={i === 0 ? "primary" : "secondary"}
                  size="lg"
                  arrowVariant="after"
                  href={button.url}
                >
                  {button.text}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
