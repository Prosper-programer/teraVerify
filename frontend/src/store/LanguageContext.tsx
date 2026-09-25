import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'EN' | 'FR';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  EN: {
    // Header & Global
    'header.hello': 'Hello',
    'header.visitor': 'Visitor',
    'header.subtitle': 'Land & Title Portal',
    'tabs.home': 'Home',
    'tabs.explore': 'Explore',
    'tabs.advisors': 'Advisors',
    'tabs.alerts': 'Alerts',
    'tabs.account': 'Account',
    
    // Search
    'search.placeholder': 'Search by title number or city...',
    
    // Community Banner
    'community.title': 'Secure Your Land Heritage',
    'community.desc': 'Direct access to cadastral data, verified sellers, and certified notaries across Cameroon.',
    'community.actionHeader': 'How would you like to start?',
    'community.buyTitle': 'I want to buy land',
    'community.buySub': 'Find verified plots with clear titles',
    'community.sellTitle': 'I want to sell land',
    'community.sellSub': 'List your property to serious buyers',
    'community.adviseTitle': 'I offer legal or survey services',
    'community.adviseSub': 'Register as a notary or surveyor',
    
    // Quick Actions
    'quick.verify': 'Verify Title',
    'quick.verifySub': 'Instant Lookup',
    'quick.advisor': 'Legal Advisor',
    'quick.advisorSub': 'Consult Experts',
    'quick.sell': 'Sell Land',
    'quick.sellSub': 'List Property',
    'quick.guide': 'Buyer Guide',
    'quick.guideSub': 'Tips & Safe Buying',
    
    // Regions
    'region.all': 'All Cameroon',
    
    // Sections
    'section.featured': 'Featured Verified Plots',
    'section.featuredSub': 'Handpicked properties with verified titles',
    'section.seeAll': 'See all',
    'section.available': 'Available Properties',
    'section.availableSub': 'Explore verified land listings across Cameroon',

    // Explore Screen
    'explore.searchPlaceholder': 'Search city, neighborhood or title...',
    'explore.plotFoundSingle': 'plot found',
    'explore.plotFoundPlural': 'plots found',
    'explore.list': 'List',
    'explore.map': 'Map',
    'explore.noLands': 'No Matching Lands Found',
    'explore.noLandsDesc': 'Try adjusting your location or price criteria to find available properties.',
    'explore.resetFilters': 'Reset All Filters',
    'explore.filterTitle': 'Filter Land Listings',
    'explore.verifyStatus': 'Verification Status',
    'explore.showVerified': 'Show Verified Lands Only (Surveyor Audited)',
    'explore.region': 'Cameroon Region',
    'explore.allRegions': 'All Regions',
    'explore.usage': 'Property Usage',
    'explore.allTypes': 'All Types',
    'explore.maxPrice': 'Maximum Price (FCFA)',
    'explore.millionFCFA': 'Million FCFA',
    'explore.minArea': 'Minimum Surface Area',
    'explore.reset': 'Reset',
    'explore.applyFilters': 'Apply Filters',

    // Advisors Screen
    'advisor.badge': 'OFFICIAL ADVISORY NETWORK',
    'advisor.title': 'Professional Guidance',
    'advisor.subtitle': 'Consult registered notaries, boundary surveyors, and legal conveyancers on Cameroon land regulations.',
    'advisor.findTab': 'Find an Advisor',
    'advisor.myTab': 'My Consultations',
    'advisor.reviews': 'reviews',
    'advisor.fee': 'Consultation Fee (Hourly)',
    'advisor.bookBtn': 'Book Appointment',
    'advisor.noApt': 'No Scheduled Consultations',
    'advisor.noAptDesc': 'Select an advisor above to book a formal session regarding land titling procedures.',
    'advisor.subject': 'Session Subject:',

    // Notifications Screen
    'notif.center': 'Notification Center',
    'notif.unreadUpdates': 'unread updates',
    'notif.allRead': 'All updates are read',
    'notif.markAllRead': 'Mark all read',
    'notif.emptyTitle': 'No Notifications',
    'notif.emptyDesc': 'You will receive real-time updates regarding your land verification requests, appointments, and payments here.',

    // Profile Screen
    'profile.signOut': 'Sign Out',
    'profile.signOutConfirm': 'Are you sure you want to sign out of TerraVerify?',
    'profile.cancel': 'Cancel',
    'profile.guest': 'Guest Visitor',
    'profile.notSignedIn': 'Not currently signed in',
    'profile.verifiedAccount': 'Phone Verified Citizen Account',
    'profile.signInCreate': 'Sign In or Create Account',
    'profile.savedPlots': 'Saved Plots',
    'profile.activeConsultation': 'Active Consultation',
    'profile.listedDossiers': 'Listed Dossiers',
    'profile.certifiedForSale': 'Certified for Sale',
    'profile.accountServices': 'Account & Services',
    'profile.verifyTitle': 'Verify Land Title Number',
    'profile.advisors': 'Advisors & Titling Consultations',
    'profile.notifSettings': 'Notification Settings',
    'profile.securityPolicy': 'Security & Cadastre Policy',
    'profile.disclaimerTitle': 'Cadastral Verification Disclaimer',
    'profile.disclaimerDesc': 'TerraVerify works with licensed surveyors who perform manual cross-checks against official cadastral archives. Estimated turnaround time is 48 hours.',
    'profile.protocol': '48-Hour Verification Protocol',
    'profile.paymentTitle': 'Security & Payment Gateway',
    'profile.paymentDesc': 'MTN Mobile Money and Orange Money API abstraction layers provide encrypted transactions with full receipt archiving.',
    'profile.dataProtection': 'Payment & Data Protection',
    'profile.signOutBtn': 'Sign Out of TerraVerify',
    'profile.signInBtn': 'Sign In to an Account',
    'profile.version': 'TerraVerify Cameroon v1.0.0 • Academic Defense Build',
    // Auth Prompts
    'auth.requiredTitle': 'Account Required',
    'auth.requiredDesc': 'You must be signed in to access this feature. Please create an account or log in.',

    // Dashboards
    'seller.subtitle': 'Seller Control Center',
    'seller.ctaTitle': 'Have a parcel to sell?',
    'seller.ctaDesc': 'Submit your land title number and survey plans for 48-hour manual verification by a certified surveyor.',
    'seller.ctaBtn': 'Submit a Land',
    'seller.statListings': 'MY LISTINGS',
    'seller.statPending': 'PENDING (48H)',
    'seller.statVerified': 'VERIFIED',
    'seller.statRejected': 'REJECTED',
    'seller.sectionTitle': 'My Property Dossiers',
    'seller.total': 'total',
    'seller.pendingBar': 'Under manual cadastral check (Est. within 48h)',
    'seller.verifiedBar': 'Published for sale • Authenticated by Surveyor',
    'seller.rejectedReason': 'Reason: ',

    'surveyor.badge': 'CERTIFIED LAND SURVEYOR',
    'surveyor.subtitle': 'Order of Certified Surveyors of Cameroon',
    'surveyor.tabPending': 'Pending Requests',
    'surveyor.tabReview': 'Under Review',
    'surveyor.tabCompleted': 'Completed',
    'surveyor.emptyTitle': 'No verification requests',
    'surveyor.emptyDesc': 'There are currently no requests in this status.',
    'surveyor.sellerLabel': 'Seller',
    'surveyor.areaLabel': 'Surface Area',
    'surveyor.submittedLabel': 'Submitted',
    'surveyor.slaLabel': 'Est. SLA',
    'surveyor.inspectBtn': 'Inspect Deed Scans & Audit Title',
    
    'advisor.roleBadge': 'CERTIFIED LEGAL & TITLING ADVISOR',
    'advisor.subtitle2': 'Notarial Due Diligence & Property Law',
    'advisor.statUpcoming': 'Upcoming Sessions',
    'advisor.statTotal': 'Total Consultations',
    'advisor.statFee': 'Standard Fee (FCFA)',
    'advisor.guideTitle': 'Cameroon Land Titling Procedure Dossiers',
    'advisor.step1': '• Direct Titling (Immatriculation Directe sur domaine national)',
    'advisor.step2': '• Total & Partial Mutation of existing Titre Foncier (Notarized Act)',
    'advisor.step3': '• Boundary dispute arbitration & non-dispute certificate verification',
    'advisor.sectionTitle': 'Client Consultations',
    'advisor.scheduled': 'scheduled',
    'advisor.subjectLabel': 'Consultation Subject:',

    'admin.welcome': 'Welcome',
    'admin.subtitle2': 'Manage user accounts and oversee land plots',
    'admin.statUsers': 'Total Users',
    'admin.statLands': 'Total Lands',
    'admin.statPending': 'Pending Verifications',
    'admin.statVerified': 'Verified Lands',
    'admin.statPayment': 'Basic Payment Count',
    'admin.tabUsers': 'User Accounts',
    'admin.tabListings': 'Land Listings',
    'admin.tabVerifications': 'Verifications',
    'admin.searchUser': 'Search by name, email or phone...',
    'admin.emptyUsersTitle': 'No users found',
    'admin.emptyUsersSub': 'Try searching with a different name or role filter.',
    'admin.suspendBtn': 'Suspend',
    'admin.activateBtn': 'Activate',
    'admin.removeBtn': 'Remove',
    'admin.logTitle': 'Cadastral Requests Log',
    'admin.logSub': 'Monitor Surveyor activities and manual verifications.',
  },
  FR: {
    // Header & Global
    'header.hello': 'Bonjour',
    'header.visitor': 'Visiteur',
    'header.subtitle': 'Portail Foncier et Cadastral',
    'tabs.home': 'Accueil',
    'tabs.explore': 'Explorer',
    'tabs.advisors': 'Conseillers',
    'tabs.alerts': 'Alertes',
    'tabs.account': 'Compte',
    
    // Search
    'search.placeholder': 'Rechercher par numéro de titre ou ville...',
    
    // Community Banner
    'community.title': 'Sécurisez Votre Patrimoine Foncier',
    'community.desc': 'Accès direct aux données cadastrales, vendeurs vérifiés et notaires certifiés au Cameroun.',
    'community.actionHeader': 'Comment souhaitez-vous commencer ?',
    'community.buyTitle': 'Je veux acheter un terrain',
    'community.buySub': 'Trouvez des parcelles vérifiées avec titres clairs',
    'community.sellTitle': 'Je veux vendre un terrain',
    'community.sellSub': 'Proposez votre bien à des acheteurs sérieux',
    'community.adviseTitle': 'J\'offre des services légaux ou d\'arpentage',
    'community.adviseSub': 'Inscrivez-vous comme notaire ou géomètre',
    
    // Quick Actions
    'quick.verify': 'Vérifier Titre',
    'quick.verifySub': 'Recherche Rapide',
    'quick.advisor': 'Conseiller Légal',
    'quick.advisorSub': 'Consulter Experts',
    'quick.sell': 'Vendre Terrain',
    'quick.sellSub': 'Lister Propriété',
    'quick.guide': 'Guide Acheteur',
    'quick.guideSub': 'Astuces Sécurité',
    
    // Regions
    'region.all': 'Tout le Cameroun',
    
    // Sections
    'section.featured': 'Parcelles Vérifiées en Vedette',
    'section.featuredSub': 'Propriétés sélectionnées avec titres vérifiés',
    'section.seeAll': 'Voir tout',
    'section.available': 'Propriétés Disponibles',
    'section.availableSub': 'Explorez les annonces vérifiées au Cameroun',

    // Explore Screen
    'explore.searchPlaceholder': 'Rechercher une ville, un quartier...',
    'explore.plotFoundSingle': 'parcelle trouvée',
    'explore.plotFoundPlural': 'parcelles trouvées',
    'explore.list': 'Liste',
    'explore.map': 'Carte',
    'explore.noLands': 'Aucun terrain correspondant trouvé',
    'explore.noLandsDesc': 'Essayez d\'ajuster vos critères de localisation ou de prix pour trouver des propriétés.',
    'explore.resetFilters': 'Réinitialiser les filtres',
    'explore.filterTitle': 'Filtrer les annonces',
    'explore.verifyStatus': 'Statut de Vérification',
    'explore.showVerified': 'Afficher uniquement les terrains vérifiés (Audités)',
    'explore.region': 'Région du Cameroun',
    'explore.allRegions': 'Toutes les Régions',
    'explore.usage': 'Usage de la propriété',
    'explore.allTypes': 'Tous les types',
    'explore.maxPrice': 'Prix Maximum (FCFA)',
    'explore.millionFCFA': 'Millions FCFA',
    'explore.minArea': 'Superficie Minimale',
    'explore.reset': 'Réinitialiser',
    'explore.applyFilters': 'Appliquer les filtres',

    // Advisors Screen
    'advisor.badge': 'RÉSEAU OFFICIEL DE CONSEILLERS',
    'advisor.title': 'Accompagnement Professionnel',
    'advisor.subtitle': 'Consultez des notaires, des géomètres et des conseillers juridiques sur la réglementation foncière.',
    'advisor.findTab': 'Trouver un Conseiller',
    'advisor.myTab': 'Mes Consultations',
    'advisor.reviews': 'avis',
    'advisor.fee': 'Frais de consultation (Horaire)',
    'advisor.bookBtn': 'Prendre Rendez-vous',
    'advisor.noApt': 'Aucune Consultation Prévue',
    'advisor.noAptDesc': 'Sélectionnez un conseiller ci-dessus pour réserver une session formelle concernant les procédures.',
    'advisor.subject': 'Sujet de la session:',

    // Notifications Screen
    'notif.center': 'Centre de Notifications',
    'notif.unreadUpdates': 'mises à jour non lues',
    'notif.allRead': 'Toutes les notifications sont lues',
    'notif.markAllRead': 'Tout marquer comme lu',
    'notif.emptyTitle': 'Aucune Notification',
    'notif.emptyDesc': 'Vous recevrez ici des mises à jour en temps réel concernant vos demandes de vérification foncière, vos rendez-vous et vos paiements.',

    // Profile Screen
    'profile.signOut': 'Déconnexion',
    'profile.signOutConfirm': 'Êtes-vous sûr de vouloir vous déconnecter de TerraVerify ?',
    'profile.cancel': 'Annuler',
    'profile.guest': 'Visiteur',
    'profile.notSignedIn': 'Non connecté actuellement',
    'profile.verifiedAccount': 'Compte Citoyen Vérifié',
    'profile.signInCreate': 'Se Connecter ou Créer un Compte',
    'profile.savedPlots': 'Terrains Sauvegardés',
    'profile.activeConsultation': 'Consultation Active',
    'profile.listedDossiers': 'Dossiers Listés',
    'profile.certifiedForSale': 'Certifié pour la Vente',
    'profile.accountServices': 'Compte & Services',
    'profile.verifyTitle': 'Vérifier un Numéro de Titre Foncier',
    'profile.advisors': 'Conseillers & Consultations',
    'profile.notifSettings': 'Paramètres de Notification',
    'profile.securityPolicy': 'Sécurité & Politique Cadastrale',
    'profile.disclaimerTitle': 'Avertissement de Vérification Cadastrale',
    'profile.disclaimerDesc': 'TerraVerify travaille avec des géomètres agréés qui effectuent des vérifications manuelles avec les archives cadastrales officielles. Le délai de traitement estimé est de 48 heures.',
    'profile.protocol': 'Protocole de Vérification de 48 Heures',
    'profile.paymentTitle': 'Sécurité & Passerelle de Paiement',
    'profile.paymentDesc': 'Les passerelles API MTN Mobile Money et Orange Money assurent des transactions chiffrées avec archivage complet des reçus.',
    'profile.dataProtection': 'Paiement & Protection des Données',
    'profile.signOutBtn': 'Se Déconnecter de TerraVerify',
    'profile.signInBtn': 'Se Connecter à un Compte',
    'profile.version': 'TerraVerify Cameroun v1.0.0 • Version Soutenance',
    // Auth Prompts
    'auth.requiredTitle': 'Compte Requis',
    'auth.requiredDesc': 'Vous devez être connecté pour accéder à cette fonctionnalité. Veuillez créer un compte ou vous connecter.',
    
    // Dashboards
    'seller.subtitle': 'Centre de Contrôle Vendeur',
    'seller.ctaTitle': 'Vous avez une parcelle à vendre ?',
    'seller.ctaDesc': 'Soumettez votre numéro de titre foncier et vos plans pour une vérification manuelle en 48h par un géomètre agréé.',
    'seller.ctaBtn': 'Soumettre un Terrain',
    'seller.statListings': 'MES ANNONCES',
    'seller.statPending': 'EN ATTENTE (48H)',
    'seller.statVerified': 'VÉRIFIÉ',
    'seller.statRejected': 'REJETÉ',
    'seller.sectionTitle': 'Mes Dossiers Immobiliers',
    'seller.total': 'total',
    'seller.pendingBar': 'En cours de vérification cadastrale (Est. 48h)',
    'seller.verifiedBar': 'Publié pour la vente • Authentifié par un Géomètre',
    'seller.rejectedReason': 'Raison : ',

    'surveyor.badge': 'GÉOMÈTRE EXPERT AGRÉÉ',
    'surveyor.subtitle': 'Ordre des Géomètres-Experts du Cameroun',
    'surveyor.tabPending': 'Demandes en Attente',
    'surveyor.tabReview': 'En Cours d\'Examen',
    'surveyor.tabCompleted': 'Terminées',
    'surveyor.emptyTitle': 'Aucune demande de vérification',
    'surveyor.emptyDesc': 'Il n\'y a actuellement aucune demande dans ce statut.',
    'surveyor.sellerLabel': 'Vendeur',
    'surveyor.areaLabel': 'Superficie',
    'surveyor.submittedLabel': 'Soumis',
    'surveyor.slaLabel': 'SLA Est.',
    'surveyor.inspectBtn': 'Inspecter les Scans et Auditer le Titre',

    'advisor.roleBadge': 'CONSEILLER JURIDIQUE & NOTARIAL AGRÉÉ',
    'advisor.subtitle2': 'Diligence Notariale & Droit Immobilier',
    'advisor.statUpcoming': 'Sessions à Venir',
    'advisor.statTotal': 'Consultations Totales',
    'advisor.statFee': 'Frais Standard (FCFA)',
    'advisor.guideTitle': 'Dossiers de Procédure de Titrage au Cameroun',
    'advisor.step1': '• Immatriculation Directe sur domaine national',
    'advisor.step2': '• Mutation Totale et Partielle d\'un Titre Foncier existant',
    'advisor.step3': '• Arbitrage de litiges frontaliers & attestation de non-litige',
    'advisor.sectionTitle': 'Consultations Clients',
    'advisor.scheduled': 'programmées',
    'advisor.subjectLabel': 'Sujet de Consultation:',

    'admin.welcome': 'Bienvenue',
    'admin.subtitle2': 'Gérer les comptes utilisateurs et superviser les parcelles',
    'admin.statUsers': 'Utilisateurs Totaux',
    'admin.statLands': 'Terrains Totaux',
    'admin.statPending': 'Vérifications en Attente',
    'admin.statVerified': 'Terrains Vérifiés',
    'admin.statPayment': 'Nombre de Paiements Basiques',
    'admin.tabUsers': 'Comptes Utilisateurs',
    'admin.tabListings': 'Annonces de Terrains',
    'admin.tabVerifications': 'Vérifications',
    'admin.searchUser': 'Rechercher par nom, email ou téléphone...',
    'admin.emptyUsersTitle': 'Aucun utilisateur trouvé',
    'admin.emptyUsersSub': 'Essayez de rechercher avec un nom ou un filtre de rôle différent.',
    'admin.suspendBtn': 'Suspendre',
    'admin.activateBtn': 'Activer',
    'admin.removeBtn': 'Retirer',
    'admin.logTitle': 'Journal des Requêtes Cadastrales',
    'admin.logSub': 'Surveiller les activités des géomètres et les vérifications manuelles.',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('EN');

  useEffect(() => {
    // Load saved language on mount
    AsyncStorage.getItem('teraverify_lang').then((saved) => {
      if (saved === 'FR' || saved === 'EN') {
        setLanguage(saved as Language);
      }
    });
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const newLang = prev === 'EN' ? 'FR' : 'EN';
      AsyncStorage.setItem('teraverify_lang', newLang);
      return newLang;
    });
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
