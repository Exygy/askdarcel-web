import React, { useState } from "react";

import { icon as assetIcon } from "assets";
import { Button } from "components/ui/inline/Button/Button";
import { QrCodeModal } from "components/ui/QrCodeModal/QrCodeModal"; // todo: remove QrCodeModal from project
import websiteConfig from "utils/websiteConfig";
import { CATEGORIES } from "pages/constants";
import { CategoryDropdown } from "./CategoryDropdown";

import styles from "./Header.module.scss";

const { showHeaderQrCode, showPrintResultsBtn } = websiteConfig;

export const Header = ({
  resultsTitle,
}: // translateResultsTitle = true,
{
  resultsTitle: string;
  // translateResultsTitle?: boolean;
}) => {
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);

  const title = resultsTitle === "" ? "All categories" : resultsTitle;

  return (
    <div className={styles.header}>
      <div className={styles.headerInner}>
        <div>
          <h1 className="sr-only">
            {title === resultsTitle ?? "Search results"}
          </h1>
          <CategoryDropdown categories={CATEGORIES} resultsTitle={title} />
        </div>
        <Button
          onClick={() => {
            setQrCodeModalOpen(true);
          }}
          addClass={`${styles.qrCodeBtn} ${
            showHeaderQrCode ? styles.showBtn : ""
          }`}
          styleType="transparent"
        >
          <>
            <img src={assetIcon("qr-code")} alt="QR code icon" />
            <span className={styles.btnText}>Resource List QR Code</span>
          </>
        </Button>
        <Button
          iconName="fas fa-print"
          iconVariant="before"
          variant="secondary"
          size="lg"
          onClick={() => {
            window.print();
          }}
          addClass={`${styles.printAllBtn} ${
            showPrintResultsBtn ? styles.showBtn : ""
          }`}
        >
          Print all results
        </Button>
        <QrCodeModal isOpen={qrCodeModalOpen} setIsOpen={setQrCodeModalOpen} />
      </div>
    </div>
  );
};
