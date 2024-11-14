import React from "react";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "pages/HomePage";
import { AboutPage } from "pages/AboutPage";
import { FaqPage } from "pages/FaqPage/FaqPage";
import { ListingDebugPage } from "pages/debug/ListingDemoPage";
import { OrganizationDetailPage } from "pages/OrganizationDetailPage";
import { PrivacyPolicyPage } from "pages/LegalPage/PrivacyPolicy";
import { ServiceDetailPage } from "pages/ServiceDetailPage/ServiceDetailPage";
import { TermsOfServicePage } from "pages/LegalPage/TermsOfService";
import { BrowseResultsPage } from "pages/BrowseResultsPage/BrowseResultsPage";
import { PageHeader } from "components/ui/Navigation/PageHeader";
import { BackButton } from "components/ui/BackButton";
import { SearchHeaderSection } from "components/searchAndBrowse/Header/SearchHeaderSection";
import { SearchResultsPage } from "pages/SearchResultsPage/SearchResultsPage";

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/faqs" element={<FaqPage />} />
      <Route path="/demo/listing" element={<ListingDebugPage />} />
      {/* NB: /organizations/new must be listed before /organizations/:id or else the /new
                step will be interpreted as an ID and will thus break the OrganizationEditPage */}
      <Route
        path="/organizations/:organizationListingId"
        element={
          <>
            <PageHeader>
              <BackButton defaultReturnTo="/search">Back</BackButton>
            </PageHeader>
            <OrganizationDetailPage />
          </>
        }
      />

      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route
        path="/search"
        element={
          <>
            <PageHeader variant="secondary">
              <SearchHeaderSection descriptionText="Sign up for programs and access resources." />
            </PageHeader>
            <SearchResultsPage />
          </>
        }
      />
      <Route
        path="/services/:serviceListingId"
        element={
          <>
            <PageHeader>
              <BackButton defaultReturnTo="/search">
                Back to Services
              </BackButton>
            </PageHeader>
            <ServiceDetailPage />
          </>
        }
      />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/:categorySlug/results" element={<BrowseResultsPage />} />
    </Routes>
  );
};
