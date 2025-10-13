import type { ReactNode } from "react";
import { PageLayout } from "../components/layout/PageLayout";
import { AppHeader } from "../components/layout/AppHeader";
import { getBackgroundStyle } from "../theme/backgrounds";

interface AppLayoutProps {
  title?: string;
  isVolunteer?: boolean;
  children: ReactNode;
  headerVariant?: "default" | "navigation";
  onBack?: () => void;
}

export const AppLayout = ({
  title,
  isVolunteer = false,
  children,
  headerVariant = "default",
  onBack,
}: AppLayoutProps) => {
  const backgroundStyle = getBackgroundStyle(isVolunteer);

  return (
    <PageLayout backgroundStyle={backgroundStyle} pt={2} pb={6}>
      <AppHeader
        title={title ?? ""}
        isVolunteer={isVolunteer}
        variant={headerVariant}
        onBack={onBack}
        logoSize={headerVariant === "navigation" ? "1.8rem" : "1.3rem"}
      />
      {children}
    </PageLayout>
  );
};
