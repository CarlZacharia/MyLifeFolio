'use client';

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useFormContext } from '../lib/FormContext';
import { useAuth } from '../lib/AuthContext';
import { useSubscription } from '../lib/SubscriptionContext';
import PersonalDataSection from '../components/PersonalDataSection';
import BeneficiariesSection from '../components/BeneficiariesSection';
import CurrentEstatePlanSection from '../components/CurrentEstatePlanSection';
import FinancialLifeSection from '../components/FinancialLifeSection';
import PeopleAdvisorsSection from '../components/PeopleAdvisorsSection';
import MedicalDataSection from '../components/MedicalDataSection';
import LandingPage from '../components/LandingPage';
import MyLifeFolioHome from '../components/MyLifeFolioHome';
import AdminDashboard from '../components/AdminDashboard';
import PlanningPathfinder from '../components/PlanningPathfinder';
import ResourcesPage from '../components/ResourcesPage';
import AboutPage from '../components/AboutPage';
import AccountSettings from '../components/AccountSettings';
import FolioCategoryPage from '../components/FolioCategoryPage';
import InsuranceCoveragePage from '../components/InsuranceCoveragePage';
import CarePreferencesSection from '../components/CarePreferencesSection';
import EndOfLifeSection from '../components/EndOfLifeSection';
import ReportsSection from '../components/ReportsSection';
import LegacySection from '../components/LegacySection';
import DocumentsVaultSection from '../components/DocumentsVaultSection';
import DigitalLifeSection from '../components/DigitalLifeSection';
import FamilyAccessManager from '../src/features/owner-settings/FamilyAccessManager';
import PricingPage from '../components/PricingPage';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PeopleIcon from '@mui/icons-material/People';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ContactsIcon from '@mui/icons-material/Contacts';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import HomeIcon from '@mui/icons-material/Home';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import Login from '../components/Login';
import Register from '../components/Register';
import WelcomeModal from '../components/WelcomeModal';
import ReauthGuard from '../components/ReauthGuard';
import { loadIntakeFromRaw } from '../lib/supabaseIntake';
import { supabase } from '../lib/supabase';

// Page type for routing
type PageType = 'landing' | 'mylifefolio-home' | 'long-term-care' | 'medicaid' | 'estate-administration' | 'admin' | 'planning-pathfinder' | 'education-center' | 'resources'
  | 'category-personal-information' | 'category-health-medical' | 'category-emergency-care' | 'category-financial-life'
  | 'category-people-advisors' | 'category-legal-documents' | 'category-legacy-life-story' | 'category-home-property' | 'category-document-uploads' | 'category-family-dependents'
  | 'category-insurance-coverage' | 'category-end-of-life' | 'category-care-decisions' | 'category-reports'
  | 'category-digital-life'
  | 'family-access-settings'
  | 'about'
  | 'account-settings'
  | 'pricing';

import { isAdminUser } from '../lib/adminUtils';

export default function MainPage() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [previousPage, setPreviousPage] = useState<PageType>('landing');
  const [initialSubTab, setInitialSubTab] = useState<number | undefined>(undefined);
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null);
  const { user } = useAuth();
  const { formData, loadFormData, updateFormData } = useFormContext();
  const { refresh: refreshSubscription } = useSubscription();
  const prevUserRef = React.useRef(user);
  const dataLoadedRef = React.useRef(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [checkoutSnackbar, setCheckoutSnackbar] = useState<'success' | 'cancelled' | null>(null);

  // Handle Stripe checkout return
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');
    if (checkoutStatus === 'success' || checkoutStatus === 'cancelled') {
      setCheckoutSnackbar(checkoutStatus);
      if (checkoutStatus === 'success') {
        refreshSubscription();
      }
      // Clean the URL
      window.history.replaceState({}, '', window.location.pathname);
      setCurrentPage('mylifefolio-home');
    }
  }, [refreshSubscription]);

  // Redirect to landing whenever user logs out
  React.useEffect(() => {
    if (prevUserRef.current && !user) {
      setCurrentPage('landing');
      dataLoadedRef.current = false;
      setDataLoaded(false);
      window.scrollTo(0, 0);
    }
    prevUserRef.current = user;
  }, [user]);

  // Load saved form data when user logs in
  React.useEffect(() => {
    const loadSavedData = async () => {
      if (!user || dataLoadedRef.current) return;
      dataLoadedRef.current = true;

      try {
        const { data: rawData } = await supabase
          .from('intakes_raw')
          .select('id')
          .eq('user_id', user.id)
          .eq('intake_type', 'EstatePlanning')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (rawData?.id) {
          const savedData = await loadIntakeFromRaw(rawData.id);
          if (savedData) {
            // Pre-populate email from auth user if not already set
            if (!savedData.email && user.email) {
              savedData.email = user.email;
            }
            loadFormData(savedData);
          }
        } else if (user.email) {
          // No saved data yet — seed email from auth profile
          updateFormData({ email: user.email });
        }
      } catch (err) {
        console.log('No existing intake found for user');
      } finally {
        setDataLoaded(true);
      }
    };
    loadSavedData();
  }, [user, loadFormData]);

  const handleNavigate = (page: string, subTab?: number) => {
    setPreviousPage(currentPage);
    setInitialSubTab(subTab);
    setCurrentPage(page as PageType);
    window.scrollTo(0, 0);
  };

  const handleAdminClick = () => {
    handleNavigate('admin');
  };

  const handleAdminBack = () => {
    setCurrentPage(previousPage);
    window.scrollTo(0, 0);
  };

  const handleProfileClick = () => {
    handleNavigate('family-access-settings');
  };

  const handleLogin = () => {
    setShowAuthModal('login');
  };

  const handleRegister = () => {
    setShowAuthModal('register');
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(null);
    // Navigate to estate planning home after successful authentication
    handleNavigate('mylifefolio-home');
  };

  const handleSwitchToLogin = () => {
    setShowAuthModal('login');
  };

  const handleSwitchToRegister = () => {
    setShowAuthModal('register');
  };

  const handleEducationItemClick = (itemId: string) => {
    // TODO: Implement education item navigation
    console.log('Education item clicked:', itemId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
          />
        );

      case 'mylifefolio-home':
        return (
          <MyLifeFolioHome
            onNavigateBack={() => handleNavigate('landing')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onNavigate={handleNavigate}
          />
        );

      // Admin Dashboard (only accessible to admin users)
      case 'admin':
        if (isAdminUser(user?.email)) {
          return <AdminDashboard onBack={handleAdminBack} />;
        }
        // Redirect non-admin users to landing
        return (
          <LandingPage
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
          />
        );

      // Resources page (Education Center + Planning Pathfinder)
      case 'resources':
        return (
          <ResourcesPage
            onNavigateBack={() => handleNavigate('landing')}
            onNavigate={handleNavigate}
            onEducationItemClick={handleEducationItemClick}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
          />
        );

      // Account Settings
      case 'account-settings':
        return (
          <AccountSettings
            onNavigateBack={() => handleNavigate(previousPage || 'landing')}
          />
        );

      // About Senior Care Resources
      case 'about':
        return (
          <AboutPage
            onNavigateBack={() => handleNavigate(previousPage || 'landing')}
          />
        );

      // Planning Pathfinder (interactive tools)
      case 'planning-pathfinder':
        return (
          <PlanningPathfinder
            onNavigateBack={() => handleNavigate('landing')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
          />
        );

      // Folio category pages
      case 'category-personal-information':
        return (
          <FolioCategoryPage
            title="Personal Information"
            icon={<PeopleIcon sx={{ fontSize: 28 }} />}
            accentColor="#1e3a5f"
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onResources={() => handleNavigate('resources')}
            onNavigate={handleNavigate}
          >
            <PersonalDataSection onSaveAndContinue={() => handleNavigate('mylifefolio-home')} />
          </FolioCategoryPage>
        );

      case 'category-health-medical':
        return (
          <FolioCategoryPage
            title="Health & Medical"
            icon={<MedicalInformationIcon sx={{ fontSize: 28 }} />}
            accentColor="#9b2226"
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onResources={() => handleNavigate('resources')}
            onNavigate={handleNavigate}
          >
            <Typography variant="h5" sx={{ color: '#9b2226', mb: 2 }}>Health & Medical</Typography>
            <Typography color="text.secondary">Coming soon — health history, medications, providers, and more.</Typography>
          </FolioCategoryPage>
        );

      case 'category-emergency-care':
        return (
          <FolioCategoryPage
            title="Medical Data"
            icon={<LocalHospitalIcon sx={{ fontSize: 28 }} />}
            accentColor="#0077b6"
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onResources={() => handleNavigate('resources')}
            onNavigate={handleNavigate}
          >
            <ReauthGuard featureKey="medical-data">
              <MedicalDataSection initialTab={initialSubTab} />
            </ReauthGuard>
          </FolioCategoryPage>
        );

      case 'category-financial-life':
        return (
          <FolioCategoryPage
            title="Financial Life"
            icon={<AccountBalanceIcon sx={{ fontSize: 28 }} />}
            accentColor="#0a5c36"
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onResources={() => handleNavigate('resources')}
            onNavigate={handleNavigate}
          >
            <ReauthGuard featureKey="financial-life">
              <FinancialLifeSection initialTab={initialSubTab} />
            </ReauthGuard>
          </FolioCategoryPage>
        );

      case 'category-people-advisors':
        return (
          <FolioCategoryPage
            title="My People & Advisors"
            icon={<ContactsIcon sx={{ fontSize: 28 }} />}
            accentColor="#2d6a4f"
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onResources={() => handleNavigate('resources')}
            onNavigate={handleNavigate}
          >
            <ReauthGuard featureKey="people-advisors">
              <PeopleAdvisorsSection />
            </ReauthGuard>
          </FolioCategoryPage>
        );

      case 'category-legal-documents':
        return (
          <FolioCategoryPage
            title="Legal Documents"
            icon={<HistoryEduIcon sx={{ fontSize: 28 }} />}
            accentColor="#7b2cbf"
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onResources={() => handleNavigate('resources')}
            onNavigate={handleNavigate}
          >
            <ReauthGuard featureKey="legal-documents">
              <CurrentEstatePlanSection />
            </ReauthGuard>
          </FolioCategoryPage>
        );

      case 'category-legacy-life-story':
        return (
          <FolioCategoryPage
            title="Legacy & Life Story"
            icon={<VideoLibraryIcon sx={{ fontSize: 28 }} />}
            accentColor="#c9a227"
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onResources={() => handleNavigate('resources')}
            onNavigate={handleNavigate}
          >
            <LegacySection initialTab={initialSubTab} />
          </FolioCategoryPage>
        );

      case 'category-home-property':
      case 'category-document-uploads':
        return (
          <FolioCategoryPage
            title="Documents Vault"
            icon={<HomeIcon sx={{ fontSize: 28 }} />}
            accentColor="#e07a2f"
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onResources={() => handleNavigate('resources')}
            onNavigate={handleNavigate}
          >
            <ReauthGuard featureKey="documents-vault">
              <DocumentsVaultSection />
            </ReauthGuard>
          </FolioCategoryPage>
        );

      case 'category-family-dependents':
        return (
          <FolioCategoryPage
            title="Family & Dependents"
            icon={<FamilyRestroomIcon sx={{ fontSize: 28 }} />}
            accentColor="#d4497a"
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onResources={() => handleNavigate('resources')}
            onNavigate={handleNavigate}
          >
            <BeneficiariesSection />
          </FolioCategoryPage>
        );

      case 'category-insurance-coverage':
        return (
          <FolioCategoryPage
            title="Insurance Coverage"
            icon={<HealthAndSafetyIcon sx={{ fontSize: 28 }} />}
            accentColor="#2e7d32"
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onResources={() => handleNavigate('resources')}
            onNavigate={handleNavigate}
          >
            <ReauthGuard featureKey="insurance-coverage">
              <InsuranceCoveragePage />
            </ReauthGuard>
          </FolioCategoryPage>
        );

      case 'category-care-decisions':
        return (
          <FolioCategoryPage
            title="Care Decisions"
            icon={<FavoriteBorderIcon sx={{ fontSize: 28 }} />}
            accentColor="#00838f"
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onResources={() => handleNavigate('resources')}
            onNavigate={handleNavigate}
          >
            <ReauthGuard featureKey="care-decisions">
              <CarePreferencesSection />
            </ReauthGuard>
          </FolioCategoryPage>
        );

      case 'category-end-of-life':
        return (
          <FolioCategoryPage
            title="End of Life Issues"
            icon={<VolunteerActivismIcon sx={{ fontSize: 28 }} />}
            accentColor="#6a1b9a"
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onResources={() => handleNavigate('resources')}
            onNavigate={handleNavigate}
          >
            <ReauthGuard featureKey="end-of-life">
              <EndOfLifeSection />
            </ReauthGuard>
          </FolioCategoryPage>
        );

      case 'category-digital-life':
        return (
          <FolioCategoryPage
            title="Digital Life"
            icon={<FingerprintIcon sx={{ fontSize: 28 }} />}
            accentColor="#00695c"
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onResources={() => handleNavigate('resources')}
            onNavigate={handleNavigate}
          >
            <ReauthGuard featureKey="digital-life">
              <DigitalLifeSection initialTab={initialSubTab} />
            </ReauthGuard>
          </FolioCategoryPage>
        );

      case 'category-reports':
        return (
          <FolioCategoryPage
            title="Reports"
            icon={<LibraryBooksIcon sx={{ fontSize: 28 }} />}
            accentColor="#455a64"
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
            onResources={() => handleNavigate('resources')}
            onNavigate={handleNavigate}
          >
            <ReportsSection />
          </FolioCategoryPage>
        );

      case 'family-access-settings':
        if (user) {
          return (
            <FolioCategoryPage
              title="Family Access"
              icon={<FamilyRestroomIcon sx={{ fontSize: 28 }} />}
              accentColor="#1a237e"
              onNavigateBack={() => handleNavigate('mylifefolio-home')}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onAdmin={handleAdminClick}
              onProfile={handleProfileClick}
              onResources={() => handleNavigate('resources')}
              onNavigate={handleNavigate}
            >
              <FamilyAccessManager />
            </FolioCategoryPage>
          );
        }
        return (
          <LandingPage
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
          />
        );

      case 'pricing':
        return (
          <PricingPage
            onNavigateBack={() => handleNavigate('mylifefolio-home')}
            onNavigate={handleNavigate}
          />
        );

      // Placeholder pages for future services
      case 'long-term-care':
      case 'medicaid':
      case 'estate-administration':
      case 'education-center':
        return (
          <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom>Coming Soon</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                This service is currently under development.
              </Typography>
              <Button variant="contained" onClick={() => handleNavigate('landing')}>
                Return to Home
              </Button>
            </Paper>
          </Box>
        );

      default:
        return (
          <LandingPage
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={handleAdminClick}
            onProfile={handleProfileClick}
          />
        );
    }
  };

  return (
    <>
      {renderPage()}

      {/* Welcome Modal — shown once when client name is empty */}
      <WelcomeModal
        open={!!user && dataLoaded && !formData.name && currentPage !== 'landing'}
        initialData={user?.user_metadata ? {
          name: user.user_metadata.name,
          address: user.user_metadata.address,
          city: user.user_metadata.city,
          state: user.user_metadata.state_of_domicile,
          zip: user.user_metadata.zip,
        } : undefined}
        onSave={(data) => {
          updateFormData(data);
        }}
      />

      {/* Authentication Modal */}
      <Dialog
        open={showAuthModal !== null}
        onClose={() => setShowAuthModal(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'visible',
          },
        }}
      >
        <IconButton
          onClick={() => setShowAuthModal(null)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            zIndex: 1,
            color: 'text.secondary',
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 0 }}>
          {showAuthModal === 'login' ? (
            <Login
              onSwitchToRegister={handleSwitchToRegister}
              onSuccess={handleAuthSuccess}
            />
          ) : showAuthModal === 'register' ? (
            <Register
              onSwitchToLogin={handleSwitchToLogin}
              onSuccess={handleAuthSuccess}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Checkout result snackbar */}
      <Snackbar
        open={checkoutSnackbar !== null}
        autoHideDuration={6000}
        onClose={() => setCheckoutSnackbar(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setCheckoutSnackbar(null)}
          severity={checkoutSnackbar === 'success' ? 'success' : 'info'}
          sx={{ width: '100%' }}
        >
          {checkoutSnackbar === 'success'
            ? 'Subscription activated! Welcome to MyLifeFolio.'
            : 'Checkout was cancelled. You can subscribe anytime from the pricing page.'}
        </Alert>
      </Snackbar>
    </>
  );
}
