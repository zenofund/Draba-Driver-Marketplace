import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import { useDraba } from '@/context/DrabaContext';
import { suggestions, type Driver } from '@/data/mock';
import { mockApi } from '@/services/mockApi';
const { drivers, messages, transactions, trips } = mockApi.catalog;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CURRENCY = '₦';

function press(action: () => void) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  action();
}

function Icon({ name, size = 20, color, strokeWidth = 2 }: { name: keyof typeof Feather.glyphMap; size?: number; color: string; strokeWidth?: number }) {
  return <Feather name={name} size={size} color={color} strokeWidth={strokeWidth} />;
}

function App() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { screen, setScreen, tripStage, setTripStage, toast } = useDraba();

  useEffect(() => {
    if (screen !== 'splash') return;
    const timer = setTimeout(() => setScreen('welcome'), 1200);
    return () => clearTimeout(timer);
  }, [screen, setScreen]);

  useEffect(() => {
    if (screen !== 'tracking') return;
    const stages: Array<'searching' | 'accepted' | 'arriving' | 'arrived' | 'started' | 'completed'> = ['searching', 'accepted', 'arriving', 'arrived', 'started', 'completed'];
    let index = stages.indexOf(tripStage);
    const timer = setInterval(() => {
      index += 1;
      if (index >= stages.length) {
        clearInterval(timer);
        return;
      }
      setTripStage(stages[index]);
    }, 2200);
    return () => clearInterval(timer);
  }, [screen, setTripStage, tripStage]);

  const screenContent = screen === 'splash' ? <SplashScreen /> :
    screen === 'welcome' ? <WelcomeScreen /> :
    screen === 'login' ? <LoginScreen /> :
    screen === 'otp' ? <OtpScreen /> :
    screen === 'verify' ? <VerifyScreen /> :
    screen === 'home' ? <HomeScreen /> :
    screen === 'search' ? <SearchScreen /> :
    screen === 'drivers' ? <DriversScreen /> :
    screen === 'booking' ? <BookingScreen /> :
    screen === 'tracking' ? <TrackingScreen /> :
    screen === 'complete' ? <CompleteScreen /> :
    screen === 'trips' ? <TripsScreen /> :
    screen === 'wallet' ? <WalletScreen /> :
    screen === 'inbox' ? <InboxScreen /> :
    screen === 'driverDashboard' ? <DriverDashboardScreen /> :
    screen === 'driverWaiting' ? <DriverWaitingScreen /> :
    screen === 'driverRequest' ? <DriverRequestScreen /> :
    screen === 'driverAccepted' ? <DriverAcceptedScreen /> :
    screen === 'driverDriving' ? <DriverDrivingScreen /> :
    screen === 'driverArrived' ? <DriverArrivedScreen /> :
    screen === 'driverStarted' ? <DriverStartedScreen /> :
    screen === 'driverCompleted' ? <DriverCompletedScreen /> :
    screen === 'driverPayment' ? <DriverPaymentScreen /> :
    screen === 'driverTrust' ? <DriverTrustScreen /> :
    screen === 'driverPerformance' ? <DriverPerformanceScreen /> :
    screen === 'driverWallet' ? <DriverWalletScreen /> :
    screen === 'driverProfile' ? <DriverProfileScreen /> :
    <ProfileScreen />;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenTransition screen={screen} content={screenContent} />
      {toast ? <Toast message={toast} colors={colors} bottom={insets.bottom + 92} /> : null}
    </View>
  );
}

function ScreenTransition({ screen, content }: { screen: string; content: React.ReactNode }) {
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>(content);
  const [outgoingContent, setOutgoingContent] = useState<React.ReactNode>(null);
  const useNativeDriver = Platform.OS !== 'web';
  const currentContent = useRef(content);
  const currentScreen = useRef(screen);
  const incomingOpacity = useRef(new Animated.Value(1)).current;
  const incomingTranslateY = useRef(new Animated.Value(0)).current;
  const outgoingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentScreen.current === screen) return;

    setOutgoingContent(currentContent.current);
    setRenderedContent(content);
    currentContent.current = content;
    currentScreen.current = screen;

    incomingOpacity.stopAnimation();
    incomingTranslateY.stopAnimation();
    outgoingOpacity.stopAnimation();
    incomingOpacity.setValue(0);
    incomingTranslateY.setValue(12);
    outgoingOpacity.setValue(1);

    Animated.parallel([
      Animated.timing(incomingOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
      Animated.spring(incomingTranslateY, {
        toValue: 0,
        damping: 22,
        stiffness: 170,
        mass: 0.85,
        useNativeDriver,
      }),
      Animated.timing(outgoingOpacity, {
        toValue: 0,
        duration: 240,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver,
      }),
    ]).start(({ finished }) => {
      if (finished) setOutgoingContent(null);
    });
  }, [content, incomingOpacity, incomingTranslateY, outgoingOpacity, screen]);

  return (
    <View style={styles.flex}>
      {outgoingContent ? (
        <Animated.View style={[styles.transitionLayer, { opacity: outgoingOpacity, pointerEvents: 'none' }]}>
          {outgoingContent}
        </Animated.View>
      ) : null}
      <Animated.View style={[styles.flex, { opacity: incomingOpacity, transform: [{ translateY: incomingTranslateY }] }]}>
        {renderedContent}
      </Animated.View>
    </View>
  );
}

function SplashScreen() {
  const colors = useColors();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <View style={[styles.logoShield, { backgroundColor: colors.primary }]}>
        <Icon name="shield" size={34} color={colors.primaryForeground} />
        <View style={[styles.logoCheck, { backgroundColor: colors.success }]}>
          <Icon name="check" size={11} color={colors.background} strokeWidth={3} />
        </View>
      </View>
      <Text style={[styles.brand, { color: colors.foreground }]}>DRABA</Text>
      <Text style={[styles.tagline, { color: colors.mutedForeground }]}>Your driver. On demand.</Text>
      <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
    </View>
  );
}

function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen } = useDraba();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, backgroundColor: colors.background }]}>
      <View style={styles.welcomeTop}>
        <View style={[styles.miniLogo, { backgroundColor: colors.primary }]}>
          <Icon name="shield" size={17} color={colors.primaryForeground} />
        </View>
        <Text style={[styles.brandSmall, { color: colors.foreground }]}>DRABA</Text>
      </View>
      <View style={styles.welcomeHero}>
        <View style={[styles.heroOrb, { backgroundColor: colors.accent }]} />
        <View style={[styles.heroCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.heroImagePlaceholder, { backgroundColor: colors.map }]}>
            <View style={[styles.heroRoad, { backgroundColor: colors.mapLine }]} />
            <View style={[styles.heroCar, { backgroundColor: colors.primary }]}>
              <Icon name="navigation" size={18} color={colors.primaryForeground} />
            </View>
            <View style={[styles.heroBadge, { backgroundColor: colors.background }]}>
              <Icon name="shield" size={13} color={colors.success} />
              <Text style={[styles.tinyText, { color: colors.foreground }]}>Verified, always</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.welcomeCopy}>
        <Text style={[styles.displayTitle, { color: colors.foreground }]}>Ride in comfort.{'\n'}Driven by trust.</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>Professional drivers.{'\n'}Verified. Reliable. Yours.</Text>
      </View>
      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 18 }]}>
        <PrimaryButton label="Get started" onPress={() => press(() => setScreen('login'))} colors={colors} />
        <Pressable onPress={() => press(() => setScreen('login'))} style={styles.ghostButton}>
          <Text style={[styles.buttonLabel, { color: colors.mutedForeground }]}>I already have an account</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AuthHeader({ title, subtitle, onBack, colors }: { title: string; subtitle: string; onBack: () => void; colors: ReturnType<typeof useColors> }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 10 }}>
      <Pressable onPress={() => press(onBack)} style={styles.backButton}>
        <Icon name="arrow-left" size={20} color={colors.foreground} />
      </Pressable>
      <Text style={[styles.authTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>{subtitle}</Text>
    </View>
  );
}

function LoginScreen() {
  const colors = useColors();
  const { setScreen, phone, setPhone } = useDraba();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingHorizontal: 24, paddingBottom: insets.bottom + 18, backgroundColor: colors.background }]}>
      <AuthHeader title="Welcome back" subtitle="Enter your phone number to continue." onBack={() => setScreen('welcome')} colors={colors} />
      <View style={styles.authForm}>
        <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Phone number</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <Text style={[styles.countryCode, { color: colors.foreground }]}>+234</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="812 345 6789"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.textInput, { color: colors.foreground }]}
            testID="phone-input"
          />
        </View>
        <View style={styles.infoLine}>
          <Icon name="lock" size={14} color={colors.success} />
          <Text style={[styles.caption, { color: colors.mutedForeground }]}>We’ll send a secure one-time code</Text>
        </View>
      </View>
      <View style={[styles.bottomCta, { paddingBottom: 0 }]}>
        <PrimaryButton label="Continue" onPress={() => press(() => setScreen('otp'))} colors={colors} />
        <Text style={[styles.terms, { color: colors.mutedForeground }]}>By continuing, you agree to our Terms of service and Privacy policy.</Text>
      </View>
    </View>
  );
}

function OtpScreen() {
  const colors = useColors();
  const { setScreen, phone } = useDraba();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const refs = useRef<Array<TextInput | null>>([]);
  const insets = useSafeAreaInsets();
  const updateCode = (value: string, index: number) => {
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };
  return (
    <View style={[styles.screen, { paddingHorizontal: 24, paddingBottom: insets.bottom + 18, backgroundColor: colors.background }]}>
      <AuthHeader title="Enter OTP" subtitle={`Sent to +234 ${phone || '812 345 6789'}`} onBack={() => setScreen('login')} colors={colors} />
      <View style={styles.authForm}>
        <View style={styles.otpRow}>
          {code.map((value, index) => (
            <TextInput
              key={index}
              ref={(ref) => { refs.current[index] = ref; }}
              value={value}
              onChangeText={(text) => updateCode(text, index)}
              keyboardType="number-pad"
              maxLength={1}
              style={[styles.otpInput, { color: colors.foreground, backgroundColor: colors.input, borderColor: value ? colors.primary : colors.border }]}
              testID={`otp-input-${index}`}
            />
          ))}
        </View>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>Resend code in <Text style={{ color: colors.foreground }}>00:30</Text></Text>
      </View>
      <View style={styles.bottomCta}>
        <PrimaryButton label="Verify number" onPress={() => press(() => setScreen('verify'))} colors={colors} />
      </View>
    </View>
  );
}

function VerifyScreen() {
  const colors = useColors();
  const { completeAuth, setScreen } = useDraba();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingHorizontal: 24, paddingBottom: insets.bottom + 18, backgroundColor: colors.background }]}>
      <AuthHeader title="Verify your identity" subtitle="Complete your profile to get started using Draba." onBack={() => setScreen('otp')} colors={colors} />
      <View style={styles.verifyList}>
        <VerificationItem icon="check-circle" title="Phone verification" subtitle="Your number is confirmed" colors={colors} />
        <VerificationItem icon="user-check" title="Profile basics" subtitle="Ready to add your name and preferences" colors={colors} muted />
        <VerificationItem icon="shield" title="Safety promise" subtitle="Every driver on Draba is verified" colors={colors} muted />
      </View>
      <View style={styles.bottomCta}>
        <PrimaryButton label="Continue to Draba" onPress={() => press(() => completeAuth())} colors={colors} />
        <Text style={[styles.caption, { color: colors.mutedForeground, textAlign: 'center' }]}>You’re in control. You can update your details anytime.</Text>
      </View>
    </View>
  );
}

function VerificationItem({ icon, title, subtitle, colors, muted }: { icon: keyof typeof Feather.glyphMap; title: string; subtitle: string; colors: ReturnType<typeof useColors>; muted?: boolean }) {
  return (
    <View style={[styles.verifyItem, { borderColor: colors.border, backgroundColor: colors.background }]}>
      <View style={[styles.verifyIcon, { backgroundColor: muted ? colors.input : colors.accent }]}>
        <Icon name={icon} size={19} color={muted ? colors.mutedForeground : colors.success} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>{subtitle}</Text>
      </View>
      <Icon name={muted ? 'chevron-right' : 'check'} size={18} color={muted ? colors.mutedForeground : colors.success} />
    </View>
  );
}

function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, showToast } = useDraba();
  return (
    <View style={[styles.mapScreen, { backgroundColor: colors.map }]}>
      <MapCanvas colors={colors} />
      <View style={[styles.mapHeader, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={[styles.caption, { color: colors.mutedForeground }]}>Good morning,</Text>
          <Text style={[styles.headerName, { color: colors.foreground }]}>Chisom</Text>
        </View>
        <View style={styles.headerActions}>
          <RoundIconButton name="bell" onPress={() => press(() => setScreen('inbox'))} colors={colors} />
          <Pressable onPress={() => press(() => setScreen('profile'))} style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>CN</Text>
          </Pressable>
        </View>
      </View>
      <View style={[styles.mapSearch, { top: insets.top + 90, backgroundColor: colors.card, borderColor: colors.border }]}>
        <Icon name="search" size={18} color={colors.mutedForeground} />
        <Pressable onPress={() => press(() => setScreen('search'))} style={styles.flex}>
          <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>Where are you going?</Text>
          <Text style={[styles.searchSubtext, { color: colors.foreground }]}>Pickup: Current location</Text>
        </Pressable>
        <RoundIconButton name="mic" onPress={() => showToast('Voice search is ready')} colors={colors} small />
      </View>
      <Pressable onPress={() => press(() => showToast('Location centered on Lagos Island'))} style={[styles.locateButton, { backgroundColor: colors.card, borderColor: colors.border, bottom: insets.bottom + 174 }]}>
        <Icon name="crosshair" size={19} color={colors.primary} />
      </Pressable>
      <View style={[styles.homeSheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 86 }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>YOUR NEXT TRIP</Text>
        <Pressable onPress={() => press(() => setScreen('search'))} style={[styles.destinationCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
          <View style={styles.routeLine} />
          <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
          <View style={styles.routeLabels}>
            <Text style={[styles.caption, { color: colors.mutedForeground }]}>Pickup</Text>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Current location</Text>
            <View style={styles.routeGap} />
            <Text style={[styles.caption, { color: colors.mutedForeground }]}>Destination</Text>
            <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>Where are you going?</Text>
          </View>
          <Icon name="chevron-right" size={19} color={colors.mutedForeground} />
        </Pressable>
        <View style={styles.quickRow}>
          <QuickAction icon="clock" label="Recent trips" onPress={() => press(() => setScreen('trips'))} colors={colors} />
          <QuickAction icon="credit-card" label="Wallet" onPress={() => press(() => setScreen('wallet'))} colors={colors} />
          <QuickAction icon="shield" label="Safety" onPress={() => press(() => showToast('Safety center is always available'))} colors={colors} />
        </View>
      </View>
      <BottomNav active="home" colors={colors} />
    </View>
  );
}

function MapCanvas({ colors, activeRoute = false }: { colors: ReturnType<typeof useColors>; activeRoute?: boolean }) {
  const points = activeRoute ? '22,280 92,245 155,265 215,195 292,156 348,110' : '30,270 92,218 160,240 224,170 295,188 370,120';
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[styles.mapBase, { backgroundColor: colors.map }]}>
        {[0, 1, 2, 3, 4].map((row) => <View key={`h-${row}`} style={[styles.mapRoadHorizontal, { top: 120 + row * 116, backgroundColor: colors.mapLine }]} />)}
        {[0, 1, 2, 3].map((column) => <View key={`v-${column}`} style={[styles.mapRoadVertical, { left: 34 + column * 112, backgroundColor: colors.mapLine }]} />)}
        <View style={[styles.mapDistrict, { top: 156, left: 32, borderColor: colors.mapLineBright }]} />
        <View style={[styles.mapDistrict, { top: 370, left: 185, borderColor: colors.mapLineBright }]} />
      </View>
      <Svg height={SCREEN_HEIGHT * 0.63} width={SCREEN_WIDTH} style={styles.mapSvg}>
        <Path d={`M ${points}`} fill="none" stroke={activeRoute ? colors.primary : colors.mapLineBright} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M 22 280 L 92 245" fill="none" stroke={colors.success} strokeWidth="4" strokeLinecap="round" />
        {[[18, 280], [92, 245], [215, 195], [348, 110]].map(([cx, cy], index) => (
          <Circle key={index} cx={cx} cy={cy} r={index === 0 ? 8 : 6} fill={index === 0 ? colors.success : colors.primary} stroke={colors.background} strokeWidth="3" />
        ))}
      </Svg>
      {!activeRoute && drivers.map((driver, index) => (
        <View key={driver.id} style={[styles.driverMarker, { left: [42, 242, 138][index], top: [246, 164, 312][index], backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.markerText, { color: colors.foreground }]}>{driver.initials}</Text>
        </View>
      ))}
      <View style={[styles.youMarker, { top: SCREEN_HEIGHT * 0.34, left: SCREEN_WIDTH * 0.54, backgroundColor: colors.primary }]}>
        <Icon name="navigation" size={16} color={colors.primaryForeground} />
      </View>
    </View>
  );
}

function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, destination, setDestination } = useDraba();
  const [query, setQuery] = useState(destination);
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.searchHeader, { paddingTop: insets.top + 10, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => press(() => setScreen('home'))} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.authTitleSmall, { color: colors.foreground }]}>Choose a destination</Text>
      </View>
      <View style={[styles.searchInputLarge, { backgroundColor: colors.input, borderColor: colors.primary }]}>
        <Icon name="search" size={19} color={colors.primary} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Search destination"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.textInput, { color: colors.foreground }]}
          onSubmitEditing={() => { if (query.trim()) { setDestination(query.trim()); setScreen('drivers'); } }}
          testID="destination-input"
        />
        {query ? <Pressable onPress={() => { setQuery(''); Keyboard.dismiss(); }}><Icon name="x-circle" size={18} color={colors.mutedForeground} /></Pressable> : <Icon name="mic" size={18} color={colors.mutedForeground} />}
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Suggested places</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => { setDestination('Current location'); setQuery('Current location'); }} style={[styles.currentLocation, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.accent }]}><Icon name="crosshair" size={17} color={colors.success} /></View>
          <View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Use current location</Text><Text style={[styles.caption, { color: colors.mutedForeground }]}>Pickup: Lagos Island</Text></View>
          <Icon name="chevron-right" size={18} color={colors.mutedForeground} />
        </Pressable>
        {suggestions.map((item) => (
          <Pressable key={item.title} onPress={() => { setDestination(item.title); setScreen('drivers'); }} style={styles.suggestionRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.input }]}><Icon name={item.icon as keyof typeof Feather.glyphMap} size={17} color={colors.primary} /></View>
            <View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.caption, { color: colors.mutedForeground }]}>{item.subtitle}</Text></View>
            <Icon name="arrow-up-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function DriversScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, destination, setSelectedDriver } = useDraba();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.compactHeader, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => press(() => setScreen('search'))} style={styles.backButton}><Icon name="arrow-left" size={20} color={colors.foreground} /></Pressable>
        <View style={styles.flex}><Text style={[styles.caption, { color: colors.mutedForeground }]}>To</Text><Text style={[styles.cardTitle, { color: colors.foreground }]}>{destination || 'Jabi Lake Mall'}</Text></View>
        <Pressable onPress={() => press(() => setScreen('search'))}><Text style={[styles.linkText, { color: colors.primary }]}>Edit</Text></Pressable>
      </View>
      <View style={styles.driverMap}><MapCanvas colors={colors} activeRoute /></View>
      <View style={[styles.driverList, { backgroundColor: colors.background, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.rowBetween}><View><Text style={[styles.sectionEyebrow, { color: colors.primary }]}>AVAILABLE NOW</Text><Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 4 }]}>Choose your driver</Text></View><View style={[styles.filterPill, { backgroundColor: colors.input }]}><Icon name="sliders" size={14} color={colors.primary} /><Text style={[styles.caption, { color: colors.foreground }]}>Filter</Text></View></View>
        <FlatList
          data={drivers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 14, gap: 12 }}
          renderItem={({ item }) => <DriverCard driver={item} colors={colors} onPress={() => { setSelectedDriver(item); press(() => setScreen('booking')); }} />}
        />
      </View>
    </View>
  );
}

function DriverCard({ driver, colors, onPress }: { driver: Driver; colors: ReturnType<typeof useColors>; onPress: () => void }) {
  const { showToast } = useDraba();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.driverCard, { backgroundColor: colors.background, borderColor: colors.border, opacity: pressed ? 0.84 : 1 }]}>
      <View style={[styles.driverPhoto, { backgroundColor: driver.accent }]}>
        <Text style={[styles.driverInitials, { color: colors.foreground }]}>{driver.initials}</Text>
        <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.card }]} />
      </View>
      <View style={styles.driverInfo}>
        <View style={styles.rowBetween}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{driver.name}</Text>{driver.premium ? <View style={[styles.premiumBadge, { backgroundColor: colors.accent }]}><Icon name="star" size={10} color={colors.warning} /><Text style={[styles.badgeText, { color: colors.accentForeground }]}>PREMIUM</Text></View> : null}</View>
        <View style={styles.driverStats}><Text style={[styles.caption, { color: colors.warning }]}>★ {driver.rating}</Text><Text style={[styles.caption, { color: colors.mutedForeground }]}>{driver.trips} trips</Text><Text style={[styles.caption, { color: colors.mutedForeground }]}>{driver.eta} away</Text></View>
        <View style={styles.rowBetween}><Pressable onPress={() => press(() => showToast(`${driver.name}'s trust profile`))} style={styles.trustLine}><Icon name="shield" size={13} color={colors.success} /><Text style={[styles.caption, { color: colors.success }]}>Trust {driver.trust}%</Text></Pressable><Text style={[styles.priceText, { color: colors.foreground }]}>{driver.rate}<Text style={[styles.caption, { color: colors.mutedForeground }]}> / min</Text></Text></View>
      </View>
      <Icon name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

function BookingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { selectedDriver, destination, setScreen, setTripStage } = useDraba();
  const [trustOpen, setTrustOpen] = useState(false);
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.compactHeader, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => press(() => setScreen('drivers'))} style={styles.backButton}><Icon name="arrow-left" size={20} color={colors.foreground} /></Pressable>
        <Text style={[styles.authTitleSmall, { color: colors.foreground }]}>Driver summary</Text>
        <Pressable onPress={() => press(() => setTrustOpen(true))}><Icon name="shield" size={20} color={colors.success} /></Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.featureDriver, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.largePhoto, { backgroundColor: selectedDriver.accent }]}><Text style={[styles.largeInitials, { color: colors.foreground }]}>{selectedDriver.initials}</Text></View>
          <Text style={[styles.displayName, { color: colors.foreground }]}>{selectedDriver.name}</Text>
          <View style={styles.centerRow}><Text style={[styles.caption, { color: colors.warning }]}>★ {selectedDriver.rating}</Text><Text style={[styles.caption, { color: colors.mutedForeground }]}> · {selectedDriver.trips} completed trips</Text></View>
          <Pressable onPress={() => press(() => setTrustOpen(true))} style={[styles.trustScorePill, { backgroundColor: colors.accent }]}>
            <Icon name="shield" size={16} color={colors.success} /><Text style={[styles.cardTitle, { color: colors.accentForeground }]}>Trust score {selectedDriver.trust}%</Text><Icon name="chevron-right" size={15} color={colors.accentForeground} />
          </Pressable>
          <Text style={[styles.body, { color: colors.mutedForeground, textAlign: 'center', marginTop: 16 }]}>{selectedDriver.bio}</Text>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 26 }]}>Trip estimate</Text>
        <View style={[styles.estimateCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <EstimateRow label="Pickup" value="Lagos Island" icon="circle" colors={colors} />
          <EstimateRow label="Destination" value={destination || 'Jabi Lake Mall'} icon="map-pin" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.rowBetween}><Text style={[styles.caption, { color: colors.mutedForeground }]}>Estimated duration</Text><Text style={[styles.cardTitle, { color: colors.foreground }]}>28 min</Text></View>
          <View style={styles.rowBetween}><Text style={[styles.caption, { color: colors.mutedForeground }]}>Estimated fare</Text><Text style={[styles.estimateAmount, { color: colors.foreground }]}>{CURRENCY}7,200</Text></View>
        </View>
        <View style={styles.paymentHint}><Icon name="credit-card" size={16} color={colors.mutedForeground} /><Text style={[styles.caption, { color: colors.mutedForeground }]}>Paystack secured payment · Visa ending 4242</Text></View>
      </ScrollView>
      <View style={[styles.fixedCta, { backgroundColor: colors.background, paddingBottom: insets.bottom + 14 }]}>
        <PrimaryButton label={`Book James · ${CURRENCY}7,200`} onPress={() => press(() => { setTripStage('searching'); setScreen('tracking'); })} colors={colors} />
      </View>
      <TrustModal visible={trustOpen} onClose={() => setTrustOpen(false)} driver={selectedDriver} colors={colors} />
    </View>
  );
}

function EstimateRow({ label, value, icon, colors }: { label: string; value: string; icon: keyof typeof Feather.glyphMap; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.estimateRow}><Icon name={icon} size={15} color={icon === 'circle' ? colors.success : colors.primary} /><View style={styles.flex}><Text style={[styles.caption, { color: colors.mutedForeground }]}>{label}</Text><Text style={[styles.cardTitle, { color: colors.foreground }]}>{value}</Text></View></View>;
}

function TrustModal({ visible, onClose, driver, colors }: { visible: boolean; onClose: () => void; driver: Driver; colors: ReturnType<typeof useColors> }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.trustModal, { backgroundColor: colors.background, paddingBottom: insets.bottom + 22 }]}>
          <View style={styles.modalHandleRow}><View style={[styles.sheetHandle, { backgroundColor: colors.border }]} /><Pressable onPress={onClose}><Icon name="x" size={20} color={colors.mutedForeground} /></Pressable></View>
          <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>TRUST PROFILE</Text>
          <View style={styles.trustHero}><View style={[styles.trustRing, { borderColor: colors.success }]}><Text style={[styles.trustNumber, { color: colors.foreground }]}>{driver.trust}</Text><Text style={[styles.tinyText, { color: colors.mutedForeground }]}>/100</Text></View><View><Text style={[styles.authTitleSmall, { color: colors.foreground }]}>{driver.name}</Text><Text style={[styles.caption, { color: colors.success }]}>Elite verified</Text></View></View>
          <View style={styles.trustGrid}><TrustMetric label="Identity" value="Verified" icon="user-check" colors={colors} /><TrustMetric label="Reliability" value="98%" icon="clock" colors={colors} /><TrustMetric label="Experience" value="8 years" icon="award" colors={colors} /><TrustMetric label="Professionalism" value="96%" icon="briefcase" colors={colors} /></View>
          <View style={[styles.trustNote, { backgroundColor: colors.background, borderColor: colors.border }]}><Icon name="shield" size={17} color={colors.success} /><Text style={[styles.caption, { color: colors.mutedForeground, flex: 1 }]}>Verified by Draba with identity, license, and face verification. {driver.trips} successful trips.</Text></View>
          <PrimaryButton label="Done" onPress={onClose} colors={colors} />
        </View>
      </View>
    </Modal>
  );
}

function TrustMetric({ label, value, icon, colors }: { label: string; value: string; icon: keyof typeof Feather.glyphMap; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.metric, { backgroundColor: colors.background, borderColor: colors.border }]}><Icon name={icon} size={16} color={colors.primary} /><Text style={[styles.tinyText, { color: colors.mutedForeground }]}>{label}</Text><Text style={[styles.cardTitle, { color: colors.foreground }]}>{value}</Text></View>;
}

function TrackingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { selectedDriver, tripStage, setScreen, showToast } = useDraba();
  const stageCopy = {
    searching: ['Searching for the best driver', 'The usually takes less than 30 seconds.'],
    accepted: [`${selectedDriver.name} accepted`, 'Your driver is on the way.'],
    arriving: ['Your driver is arriving', `${selectedDriver.name} is 2 minutes away.`],
    arrived: ['Your driver has arrived', `${selectedDriver.name} is waiting at your pickup point.`],
    started: ['Trip in progress', `You’re on your way to your destination.`],
    completed: ['Trip completed', 'Thanks for riding with Draba.'],
  }[tripStage];
  useEffect(() => {
    if (tripStage === 'completed') {
      const timer = setTimeout(() => setScreen('complete'), 1400);
      return () => clearTimeout(timer);
    }
  }, [setScreen, tripStage]);
  return (
    <View style={[styles.mapScreen, { backgroundColor: colors.map }]}>
      <MapCanvas colors={colors} activeRoute />
      <View style={[styles.trackingTop, { paddingTop: insets.top + 12 }]}>
        <RoundIconButton name="chevron-left" onPress={() => press(() => setScreen('home'))} colors={colors} />
        <View style={[styles.livePill, { backgroundColor: colors.card }]}><View style={[styles.pulseDot, { backgroundColor: colors.success }]} /><Text style={[styles.caption, { color: colors.foreground }]}>LIVE TRIP</Text></View>
        <RoundIconButton name="more-horizontal" onPress={() => press(() => showToast('Trip options'))} colors={colors} />
      </View>
      <View style={[styles.trackingCard, { backgroundColor: colors.background, paddingBottom: insets.bottom + 18 }]}>
        <View style={styles.progressTrack}>{['searching', 'accepted', 'arriving', 'arrived', 'started'].map((stage, index) => <View key={stage} style={[styles.progressSegment, { backgroundColor: ['searching', 'accepted', 'arriving', 'arrived', 'started'].indexOf(tripStage) >= index ? colors.primary : colors.input }]} />)}</View>
        <Text style={[styles.authTitleSmall, { color: colors.foreground, marginTop: 20 }]}>{stageCopy[0]}</Text>
        <Text style={[styles.body, { color: colors.mutedForeground, marginTop: 6 }]}>{stageCopy[1]}</Text>
        <View style={[styles.trackingDriver, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.driverPhotoSmall, { backgroundColor: selectedDriver.accent }]}><Text style={[styles.driverInitialsSmall, { color: colors.foreground }]}>{selectedDriver.initials}</Text></View>
          <View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{selectedDriver.name}</Text><Text style={[styles.caption, { color: colors.mutedForeground }]}>Toyota Camry · ABC 123 XY</Text></View>
          <View style={{ alignItems: 'flex-end' }}><Text style={[styles.caption, { color: colors.warning }]}>★ {selectedDriver.rating}</Text><Text style={[styles.caption, { color: colors.success }]}>Trust {selectedDriver.trust}%</Text></View>
        </View>
        <View style={styles.tripActions}><OutlineButton label="Call" icon="phone" onPress={() => showToast('Calling James Okoro')} colors={colors} /><OutlineButton label="Chat" icon="message-circle" onPress={() => showToast('Chat opened')} colors={colors} /><OutlineButton label="Share trip" icon="share-2" onPress={() => showToast('Trip link copied')} colors={colors} /></View>
        <Pressable onPress={() => press(() => setScreen('home'))} style={styles.cancelTrip}><Text style={[styles.caption, { color: colors.mutedForeground }]}>Cancel trip</Text></Pressable>
      </View>
    </View>
  );
}

function CompleteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, showToast } = useDraba();
  const [rating, setRating] = useState(0);
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: insets.top + 28, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.completeTop}><Text style={[styles.sectionEyebrow, { color: colors.primary }]}>TRIP COMPLETED</Text><Pressable onPress={() => press(() => setScreen('home'))}><Icon name="x" size={20} color={colors.mutedForeground} /></Pressable></View>
      <View style={styles.completeHero}><View style={[styles.successCircle, { backgroundColor: colors.success }]}><Icon name="check" size={44} color={colors.background} strokeWidth={3} /></View><Text style={[styles.displayTitle, { color: colors.foreground, textAlign: 'center', marginTop: 24 }]}>You arrived safely.</Text><Text style={[styles.body, { color: colors.mutedForeground, textAlign: 'center', marginTop: 8 }]}>Your payment was processed securely through Paystack.</Text></View>
      <View style={[styles.receiptCard, { backgroundColor: colors.background, borderColor: colors.border }]}><View style={styles.rowBetween}><Text style={[styles.caption, { color: colors.mutedForeground }]}>Trip fare</Text><Text style={[styles.cardTitle, { color: colors.foreground }]}>₦7,200</Text></View><View style={styles.rowBetween}><Text style={[styles.caption, { color: colors.mutedForeground }]}>Payment method</Text><Text style={[styles.caption, { color: colors.foreground }]}>Visa · 4242</Text></View><View style={[styles.divider, { backgroundColor: colors.border }]} /><View style={styles.rowBetween}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Total paid</Text><Text style={[styles.estimateAmount, { color: colors.success }]}>₦7,200</Text></View></View>
      <View style={styles.ratingWrap}><Text style={[styles.cardTitle, { color: colors.foreground, textAlign: 'center' }]}>How was your trip?</Text><View style={styles.stars}>{[1, 2, 3, 4, 5].map((star) => <Pressable key={star} onPress={() => press(() => setRating(star))}><Icon name="star" size={30} color={star <= rating ? colors.warning : colors.input} /></Pressable>)}</View></View>
      <View style={styles.bottomCta}><PrimaryButton label="Submit rating" onPress={() => press(() => { showToast('Thanks for keeping Draba trusted'); setScreen('home'); })} colors={colors} disabled={rating === 0} /><Pressable onPress={() => press(() => setScreen('home'))} style={styles.ghostButton}><Text style={[styles.buttonLabel, { color: colors.mutedForeground }]}>Maybe later</Text></Pressable></View>
    </View>
  );
}

function TripsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen } = useDraba();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <PageHeader title="Your trips" subtitle="Every journey, in one place" onBack={() => setScreen('home')} colors={colors} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.upcomingCard, { backgroundColor: colors.background, borderColor: colors.border }]}><View style={styles.rowBetween}><View><Text style={[styles.sectionEyebrow, { color: colors.primary }]}>UPCOMING</Text><Text style={[styles.cardTitle, { color: colors.foreground, marginTop: 6 }]}>Plan a safe trip</Text></View><Icon name="calendar" size={20} color={colors.primary} /></View><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 16 }]}>Book a verified driver whenever you need one.</Text><Pressable onPress={() => press(() => setScreen('search'))} style={[styles.smallCta, { backgroundColor: colors.primary }]}><Text style={[styles.caption, { color: colors.primaryForeground }]}>Book a driver</Text><Icon name="arrow-up-right" size={14} color={colors.primaryForeground} /></Pressable></View>
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 26 }]}>Recent trips</Text>
        {trips.map((trip) => <TripRow key={trip.id} trip={trip} colors={colors} />)}
      </ScrollView>
      <BottomNav active="trips" colors={colors} />
    </View>
  );
}

function TripRow({ trip, colors }: { trip: typeof trips[number]; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.tripRow, { borderBottomColor: colors.border }]}><View style={[styles.iconCircle, { backgroundColor: colors.input }]}><Icon name="navigation" size={16} color={colors.primary} /></View><View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{trip.route}</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 3 }]}>{trip.driver} · {trip.date}</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{trip.amount}</Text><Text style={[styles.tinyText, { color: colors.success, marginTop: 3 }]}>{trip.status}</Text></View></View>;
}

function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, showToast } = useDraba();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <PageHeader title="Wallet" subtitle="Simple, secure payments" onBack={() => setScreen('home')} colors={colors} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.balanceCard, { backgroundColor: colors.background, borderColor: colors.border }]}><View style={styles.rowBetween}><Text style={[styles.caption, { color: colors.mutedForeground }]}>AVAILABLE BALANCE</Text><Icon name="more-horizontal" size={19} color={colors.mutedForeground} /></View><Text style={[styles.balanceAmount, { color: colors.foreground }]}>₦38,420</Text><Text style={[styles.caption, { color: colors.mutedForeground }]}>•••• 4242 · Paystack secured</Text><View style={styles.walletActions}><Pressable onPress={() => press(() => showToast('Top up flow opened'))} style={[styles.walletAction, { backgroundColor: colors.primary }]}><Icon name="plus" size={16} color={colors.primaryForeground} /><Text style={[styles.caption, { color: colors.primaryForeground }]}>Top up</Text></Pressable><Pressable onPress={() => press(() => showToast('Payment methods opened'))} style={[styles.walletAction, { backgroundColor: colors.input }]}><Icon name="credit-card" size={16} color={colors.foreground} /><Text style={[styles.caption, { color: colors.foreground }]}>Methods</Text></Pressable></View></View>
        <View style={styles.rowBetween}><Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 26 }]}>Activity</Text><Text style={[styles.linkText, { color: colors.primary, marginTop: 26 }]}>See all</Text></View>
        {transactions.map((transaction) => <View key={transaction.id} style={[styles.transactionRow, { borderBottomColor: colors.border }]}><View style={[styles.iconCircle, { backgroundColor: transaction.type === 'credit' ? colors.accent : colors.input }]}><Icon name={transaction.type === 'credit' ? 'arrow-down-left' : 'navigation'} size={16} color={transaction.type === 'credit' ? colors.success : colors.primary} /></View><View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{transaction.label}</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 3 }]}>{transaction.date}</Text></View><Text style={[styles.cardTitle, { color: transaction.type === 'credit' ? colors.success : colors.foreground }]}>{transaction.amount}</Text></View>)}
      </ScrollView>
      <BottomNav active="wallet" colors={colors} />
    </View>
  );
}

function InboxScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, showToast } = useDraba();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <PageHeader title="Inbox" subtitle="Your updates and receipts" onBack={() => setScreen('home')} colors={colors} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        {messages.map((message) => <Pressable key={message.id} onPress={() => press(() => showToast('Message marked as read'))} style={[styles.messageRow, { backgroundColor: colors.background, borderColor: colors.border }]}><View style={[styles.iconCircle, { backgroundColor: message.unread ? colors.accent : colors.input }]}><Icon name={message.icon as keyof typeof Feather.glyphMap} size={17} color={message.unread ? colors.success : colors.mutedForeground} /></View><View style={styles.flex}><View style={styles.rowBetween}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{message.title}</Text><Text style={[styles.tinyText, { color: colors.mutedForeground }]}>{message.time}</Text></View><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 4 }]}>{message.body}</Text></View>{message.unread ? <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} /> : null}</Pressable>)}
        <View style={styles.emptySafety}><Icon name="shield" size={22} color={colors.success} /><Text style={[styles.cardTitle, { color: colors.foreground, marginTop: 10 }]}>Your safety comes first</Text><Text style={[styles.caption, { color: colors.mutedForeground, textAlign: 'center', marginTop: 5 }]}>SOS, trip sharing, and support are available from every trip.</Text></View>
      </ScrollView>
      <BottomNav active="inbox" colors={colors} />
    </View>
  );
}

function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, resetDemo, showToast } = useDraba();
  const rows: Array<{ icon: keyof typeof Feather.glyphMap; label: string; action: () => void }> = [
    { icon: 'user', label: 'Personal details', action: () => showToast('Your details are verified') },
    { icon: 'shield', label: 'Safety center', action: () => showToast('Safety center opened') },
    { icon: 'help-circle', label: 'Help & support', action: () => showToast('Support is here for you') },
    { icon: 'settings', label: 'Settings', action: () => showToast('Settings opened') },
    { icon: 'briefcase', label: 'Switch to driver mode', action: () => { setScreen('driverDashboard'); } },
  ];
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <PageHeader title="Profile" subtitle="Your trusted Draba account" onBack={() => setScreen('home')} colors={colors} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHero}><View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}><Text style={[styles.profileInitials, { color: colors.primaryForeground }]}>CN</Text></View><Text style={[styles.displayName, { color: colors.foreground, marginTop: 14 }]}>Chisom Ndudim</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 3 }]}>Member since August 2026</Text><View style={[styles.verifiedPill, { backgroundColor: colors.accent }]}><Icon name="check-circle" size={13} color={colors.success} /><Text style={[styles.caption, { color: colors.accentForeground }]}>Identity verified</Text></View></View>
        <View style={styles.profileRows}>{rows.map((row) => <Pressable key={row.label} onPress={() => press(row.action)} style={[styles.profileRow, { borderBottomColor: colors.border }]}><View style={[styles.iconCircle, { backgroundColor: colors.input }]}><Icon name={row.icon} size={17} color={colors.primary} /></View><Text style={[styles.cardTitle, { color: colors.foreground, flex: 1 }]}>{row.label}</Text><Icon name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable>)}</View>
        <Pressable onPress={() => press(() => resetDemo())} style={[styles.signOutButton, { borderColor: colors.border }]}><Icon name="log-out" size={16} color={colors.destructive} /><Text style={[styles.caption, { color: colors.destructive }]}>Sign out of demo</Text></Pressable>
      </ScrollView>
    </View>
  );
}

function DriverDashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, setDriverOnline, setDriverStage, showToast } = useDraba();
  const goOnline = () => {
    setDriverOnline(true);
    setDriverStage('waiting');
    setScreen('driverWaiting');
  };
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.driverHeader, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>DRIVER MODE</Text>
          <Text style={[styles.headerName, { color: colors.foreground }]}>Good morning, Chisom</Text>
        </View>
        <Pressable onPress={() => press(() => setScreen('driverProfile'))} style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>CN</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 28, paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>EARNINGS THIS WEEK</Text>
        <View style={styles.earningsRow}>
          <Text style={[styles.driverEarnings, { color: colors.foreground }]}>₦86,420</Text>
          <View style={[styles.changePill, { backgroundColor: colors.accent }]}><Icon name="trending-up" size={13} color={colors.success} /><Text style={[styles.tinyText, { color: colors.success }]}>12.4%</Text></View>
        </View>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>After Draba service fees · 24 trips</Text>
        <View style={[styles.driverOnlinePanel, { borderColor: colors.border, backgroundColor: colors.background }]}>
          <View style={styles.rowBetween}>
            <View style={styles.iconTitleRow}><View style={[styles.driverStatusDot, { backgroundColor: colors.success }]} /><View><Text style={[styles.cardTitle, { color: colors.foreground }]}>You’re offline</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 3 }]}>Go online to receive nearby requests</Text></View></View>
            <Icon name="power" size={19} color={colors.mutedForeground} />
          </View>
          <Pressable onPress={() => press(goOnline)} style={[styles.goOnlineButton, { backgroundColor: colors.primary }]}>
            <Icon name="radio" size={17} color={colors.primaryForeground} />
            <Text style={[styles.buttonLabel, { color: colors.primaryForeground }]}>Go online</Text>
          </Pressable>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 30 }]}>Your trust</Text>
        <Pressable onPress={() => press(() => setScreen('driverTrust'))} style={[styles.trustSummary, { borderColor: colors.border }]}>
          <View style={[styles.trustScoreBadge, { backgroundColor: colors.accent }]}><Text style={[styles.trustScoreValue, { color: colors.success }]}>96</Text><Text style={[styles.tinyText, { color: colors.accentForeground }]}>/100</Text></View>
          <View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Excellent standing</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 3 }]}>Your trust score is higher than 87% of drivers</Text></View>
          <Icon name="chevron-right" size={18} color={colors.mutedForeground} />
        </Pressable>
        <View style={styles.driverQuickGrid}>
          <DriverQuickStat icon="activity" label="Performance" value="98%" onPress={() => setScreen('driverPerformance')} colors={colors} />
          <DriverQuickStat icon="credit-card" label="Wallet" value="₦186k" onPress={() => setScreen('driverWallet')} colors={colors} />
        </View>
        <Pressable onPress={() => press(() => showToast('Your driver schedule is clear today'))} style={[styles.scheduleHint, { backgroundColor: colors.input }]}>
          <Icon name="calendar" size={17} color={colors.primary} />
          <View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Availability today</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 2 }]}>You’re available from 8:00 AM to 8:00 PM</Text></View>
          <Icon name="chevron-right" size={17} color={colors.mutedForeground} />
        </Pressable>
      </ScrollView>
      <DriverBottomNav active="dashboard" colors={colors} />
    </View>
  );
}

function DriverWaitingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, setDriverOnline, setDriverStage } = useDraba();
  const showRequest = () => {
    setDriverStage('request');
    setScreen('driverRequest');
  };
  return (
    <View style={[styles.mapScreen, { backgroundColor: colors.map }]}>
      <MapCanvas colors={colors} />
      <View style={[styles.driverOverlayHeader, { paddingTop: insets.top + 12 }]}>
        <RoundIconButton name="chevron-left" onPress={() => press(() => setScreen('driverDashboard'))} colors={colors} />
        <View style={[styles.livePill, { backgroundColor: colors.card }]}><View style={[styles.pulseDot, { backgroundColor: colors.success }]} /><Text style={[styles.caption, { color: colors.foreground }]}>ONLINE</Text></View>
        <RoundIconButton name="sliders" onPress={() => press(() => setScreen('driverProfile'))} colors={colors} />
      </View>
      <View style={[styles.driverWaitingSheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 88 }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        <Text style={[styles.sectionEyebrow, { color: colors.success }]}>05 · ONLINE WAITING</Text>
        <Text style={[styles.driverSheetTitle, { color: colors.foreground }]}>Nearby demand</Text>
        <Text style={[styles.body, { color: colors.mutedForeground, marginTop: 4 }]}>You’re visible to clients around Lagos Island.</Text>
        <View style={styles.demandStats}>
          <DriverKpi label="Requests nearby" value="05" icon="users" colors={colors} />
          <DriverKpi label="Avg. wait" value="3 min" icon="clock" colors={colors} />
          <DriverKpi label="Availability" value="On" icon="radio" colors={colors} />
        </View>
        <Pressable onPress={() => press(showRequest)} style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 19 }]}>
          <Icon name="bell" size={17} color={colors.primaryForeground} />
          <Text style={[styles.buttonLabel, { color: colors.primaryForeground }]}>View incoming request</Text>
        </Pressable>
        <Pressable onPress={() => press(() => { setDriverOnline(false); setDriverStage('idle'); setScreen('driverDashboard'); })} style={styles.ghostButton}>
          <Text style={[styles.buttonLabel, { color: colors.mutedForeground }]}>Go offline</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DriverRequestScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, setDriverStage } = useDraba();
  const [countdown, setCountdown] = useState(18);
  useEffect(() => {
    const timer = setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, []);
  const accept = () => {
    setDriverStage('accepted');
    setScreen('driverAccepted');
  };
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.compactHeader, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => press(() => setScreen('driverWaiting'))} style={styles.backButton}><Icon name="chevron-left" size={21} color={colors.foreground} /></Pressable>
        <View style={styles.flex}><Text style={[styles.sectionEyebrow, { color: colors.warning }]}>06 · NEW REQUEST</Text><Text style={[styles.authTitleSmall, { color: colors.foreground, marginTop: 4 }]}>A client needs you</Text></View>
        <View style={[styles.countdownPill, { backgroundColor: colors.accent }]}><Icon name="clock" size={13} color={colors.warning} /><Text style={[styles.cardTitle, { color: colors.warning }]}>00:{String(countdown).padStart(2, '0')}</Text></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 10, paddingBottom: insets.bottom + 25 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.requestHero, { backgroundColor: colors.input }]}>
          <View style={[styles.requestClientAvatar, { backgroundColor: colors.primary }]}><Text style={[styles.driverInitials, { color: colors.primaryForeground }]}>AO</Text></View>
          <View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Amara Okafor</Text><Text style={[styles.caption, { color: colors.success, marginTop: 3 }]}><Icon name="shield" size={12} color={colors.success} /> Verified client</Text></View>
          <View style={{ alignItems: 'flex-end' }}><Text style={[styles.caption, { color: colors.warning }]}>★ 4.9</Text><Text style={[styles.tinyText, { color: colors.mutedForeground, marginTop: 3 }]}>12 trips</Text></View>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 28 }]}>Trip details</Text>
        <View style={[styles.requestDetails, { borderColor: colors.border }]}>
          <RouteRow icon="circle" label="Pickup" value="Landmark Beach, Oniru" color={colors.success} colors={colors} />
          <RouteRow icon="map-pin" label="Destination" value="Murtala Muhammed Airport" color={colors.primary} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.driverKpiRow}><DriverKpi label="Distance" value="6.4 km" icon="navigation" colors={colors} /><DriverKpi label="Est. time" value="24 min" icon="clock" colors={colors} /><DriverKpi label="Your fare" value="₦6,540" icon="credit-card" colors={colors} /></View>
        </View>
        <View style={[styles.requestNote, { borderColor: colors.border }]}><Icon name="info" size={16} color={colors.primary} /><Text style={[styles.caption, { color: colors.mutedForeground, flex: 1 }]}>The client owns the vehicle. Please arrive at the pickup point before starting the trip.</Text></View>
        <SwipeAccept onAccept={accept} colors={colors} />
        <Pressable onPress={() => press(() => setScreen('driverWaiting'))} style={styles.ghostButton}><Text style={[styles.buttonLabel, { color: colors.mutedForeground }]}>Decline request</Text></Pressable>
      </ScrollView>
    </View>
  );
}

function DriverAcceptedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, showToast } = useDraba();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <PageHeader title="Accepted" subtitle="The client is expecting you" onBack={() => setScreen('driverWaiting')} colors={colors} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 5, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <StagePill label="07 · ACCEPTED" icon="check-circle" colors={colors} />
        <View style={styles.acceptedHero}><View style={[styles.etaCircle, { borderColor: colors.primary }]}><Text style={[styles.etaNumber, { color: colors.foreground }]}>07</Text><Text style={[styles.tinyText, { color: colors.mutedForeground }]}>MIN</Text></View><Text style={[styles.displayTitle, { color: colors.foreground, textAlign: 'center', marginTop: 22 }]}>Navigate to pickup.</Text><Text style={[styles.body, { color: colors.mutedForeground, textAlign: 'center', marginTop: 7 }]}>Landmark Beach, Oniru</Text></View>
        <View style={[styles.routeSummary, { borderColor: colors.border }]}><RouteRow icon="circle" label="Pickup" value="Landmark Beach, Oniru" color={colors.success} colors={colors} /><RouteRow icon="map-pin" label="Destination" value="Murtala Muhammed Airport" color={colors.primary} colors={colors} /></View>
        <Pressable onPress={() => press(() => setScreen('driverDriving'))} style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 25 }]}><Icon name="navigation" size={17} color={colors.primaryForeground} /><Text style={[styles.buttonLabel, { color: colors.primaryForeground }]}>Start navigation</Text></Pressable>
        <View style={styles.tripActions}><OutlineButton label="Call client" icon="phone" onPress={() => showToast('Calling Amara Okafor')} colors={colors} /><OutlineButton label="Message" icon="message-circle" onPress={() => showToast('Message opened')} colors={colors} /></View>
      </ScrollView>
    </View>
  );
}

function DriverDrivingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, showToast } = useDraba();
  return (
    <View style={[styles.mapScreen, { backgroundColor: colors.map }]}>
      <MapCanvas colors={colors} activeRoute />
      <View style={[styles.driverOverlayHeader, { paddingTop: insets.top + 12 }]}>
        <RoundIconButton name="chevron-left" onPress={() => press(() => setScreen('driverAccepted'))} colors={colors} />
        <View style={[styles.livePill, { backgroundColor: colors.card }]}><View style={[styles.pulseDot, { backgroundColor: colors.primary }]} /><Text style={[styles.caption, { color: colors.foreground }]}>08 · EN ROUTE</Text></View>
        <RoundIconButton name="more-horizontal" onPress={() => press(() => showToast('Navigation options'))} colors={colors} />
      </View>
      <View style={[styles.driverTripSheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 18 }]}>
        <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>DRIVING TO CLIENT</Text>
        <View style={styles.rowBetween}><View><Text style={[styles.driverSheetTitle, { color: colors.foreground }]}>Landmark Beach</Text><Text style={[styles.body, { color: colors.mutedForeground, marginTop: 3 }]}>Oniru · 5.2 km remaining</Text></View><View style={styles.etaBlock}><Text style={[styles.etaNumberSmall, { color: colors.foreground }]}>07</Text><Text style={[styles.tinyText, { color: colors.mutedForeground }]}>MIN ETA</Text></View></View>
        <View style={[styles.navigationHint, { backgroundColor: colors.input }]}><Icon name="corner-up-right" size={19} color={colors.primary} /><Text style={[styles.cardTitle, { color: colors.foreground, flex: 1 }]}>Turn right onto Ahmadu Bello Way</Text><Text style={[styles.caption, { color: colors.mutedForeground }]}>400 m</Text></View>
        <View style={styles.tripActions}><OutlineButton label="Call" icon="phone" onPress={() => showToast('Calling Amara Okafor')} colors={colors} /><OutlineButton label="Chat" icon="message-circle" onPress={() => showToast('Message opened')} colors={colors} /><OutlineButton label="Share" icon="share-2" onPress={() => showToast('Route shared')} colors={colors} /></View>
        <Pressable onPress={() => press(() => setScreen('driverArrived'))} style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 14 }]}><Icon name="map-pin" size={17} color={colors.primaryForeground} /><Text style={[styles.buttonLabel, { color: colors.primaryForeground }]}>I’ve arrived</Text></Pressable>
      </View>
    </View>
  );
}

function DriverArrivedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, showToast } = useDraba();
  const [waitSeconds, setWaitSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setWaitSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <PageHeader title="Arrived" subtitle="The client has been notified" onBack={() => setScreen('driverDriving')} colors={colors} />
      <View style={styles.arrivedContent}>
        <StagePill label="09 · ARRIVED" icon="map-pin" colors={colors} />
        <View style={[styles.waitingIcon, { backgroundColor: colors.accent }]}><Icon name="clock" size={32} color={colors.success} /></View>
        <Text style={[styles.displayTitle, { color: colors.foreground, textAlign: 'center', marginTop: 20 }]}>Waiting for Amara.</Text>
        <Text style={[styles.body, { color: colors.mutedForeground, textAlign: 'center', marginTop: 7 }]}>You’re at Landmark Beach pickup.</Text>
        <Text style={[styles.waitTimer, { color: colors.foreground }]}>{String(Math.floor(waitSeconds / 60)).padStart(2, '0')}:{String(waitSeconds % 60).padStart(2, '0')}</Text>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>WAITING TIME</Text>
        <View style={[styles.clientNotified, { borderColor: colors.border }]}><Icon name="check-circle" size={17} color={colors.success} /><Text style={[styles.caption, { color: colors.mutedForeground, flex: 1 }]}>Amara has been notified that you’ve arrived.</Text></View>
      </View>
      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 18 }]}><PrimaryButton label="Start trip" onPress={() => press(() => setScreen('driverStarted'))} colors={colors} /><Pressable onPress={() => press(() => showToast('Client has been notified again'))} style={styles.ghostButton}><Text style={[styles.buttonLabel, { color: colors.mutedForeground }]}>Notify client again</Text></Pressable></View>
    </View>
  );
}

function DriverStartedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, showToast } = useDraba();
  return (
    <View style={[styles.mapScreen, { backgroundColor: colors.map }]}>
      <MapCanvas colors={colors} activeRoute />
      <View style={[styles.driverOverlayHeader, { paddingTop: insets.top + 12 }]}>
        <View style={[styles.livePill, { backgroundColor: colors.card }]}><View style={[styles.pulseDot, { backgroundColor: colors.success }]} /><Text style={[styles.caption, { color: colors.foreground }]}>10 · TRIP STARTED</Text></View>
        <RoundIconButton name="more-horizontal" onPress={() => press(() => showToast('Trip options'))} colors={colors} />
      </View>
      <View style={[styles.driverTripSheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 18 }]}>
        <Text style={[styles.sectionEyebrow, { color: colors.success }]}>NAVIGATION</Text>
        <View style={styles.rowBetween}><View><Text style={[styles.driverSheetTitle, { color: colors.foreground }]}>Murtala Muhammed Airport</Text><Text style={[styles.body, { color: colors.mutedForeground, marginTop: 3 }]}>Destination · 18.4 km remaining</Text></View><View style={styles.etaBlock}><Text style={[styles.etaNumberSmall, { color: colors.foreground }]}>24</Text><Text style={[styles.tinyText, { color: colors.mutedForeground }]}>MIN ETA</Text></View></View>
        <View style={[styles.navigationHint, { backgroundColor: colors.input }]}><Icon name="navigation" size={18} color={colors.primary} /><Text style={[styles.cardTitle, { color: colors.foreground, flex: 1 }]}>Continue straight for 2.1 km</Text><Text style={[styles.caption, { color: colors.mutedForeground }]}>2.1 km</Text></View>
        <View style={styles.tripActions}><OutlineButton label="Pause" icon="pause" onPress={() => showToast('Trip paused')} colors={colors} /><OutlineButton label="Emergency" icon="alert-circle" onPress={() => showToast('Emergency support is ready')} colors={colors} /><OutlineButton label="Share" icon="share-2" onPress={() => showToast('Trip shared')} colors={colors} /></View>
        <Pressable onPress={() => press(() => setScreen('driverCompleted'))} style={[styles.primaryButton, { backgroundColor: colors.success, marginTop: 14 }]}><Icon name="check" size={17} color={colors.background} strokeWidth={3} /><Text style={[styles.buttonLabel, { color: colors.background }]}>End trip</Text></Pressable>
      </View>
    </View>
  );
}

function DriverCompletedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, setDriverStage } = useDraba();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: insets.top + 28, paddingBottom: insets.bottom + 16 }]}>
      <StagePill label="11 · TRIP COMPLETED" icon="check-circle" colors={colors} />
      <View style={styles.completeHero}><View style={[styles.successCircle, { backgroundColor: colors.success }]}><Icon name="check" size={44} color={colors.background} strokeWidth={3} /></View><Text style={[styles.displayTitle, { color: colors.foreground, textAlign: 'center', marginTop: 24 }]}>Trip complete.</Text><Text style={[styles.body, { color: colors.mutedForeground, textAlign: 'center', marginTop: 8 }]}>Awaiting client confirmation before your wallet is updated.</Text></View>
      <View style={[styles.receiptCard, { borderColor: colors.border }]}><View style={styles.rowBetween}><Text style={[styles.caption, { color: colors.mutedForeground }]}>Client</Text><Text style={[styles.cardTitle, { color: colors.foreground }]}>Amara Okafor</Text></View><View style={styles.rowBetween}><Text style={[styles.caption, { color: colors.mutedForeground }]}>Trip fare</Text><Text style={[styles.estimateAmount, { color: colors.foreground }]}>₦6,540</Text></View><View style={styles.rowBetween}><Text style={[styles.caption, { color: colors.mutedForeground }]}>Status</Text><Text style={[styles.caption, { color: colors.warning }]}>Awaiting confirmation</Text></View></View>
      <View style={styles.bottomCta}><PrimaryButton label="Simulate client confirmation" onPress={() => press(() => { setDriverStage('completed'); setScreen('driverPayment'); })} colors={colors} /><Pressable onPress={() => press(() => setScreen('driverDashboard'))} style={styles.ghostButton}><Text style={[styles.buttonLabel, { color: colors.mutedForeground }]}>Return to dashboard</Text></Pressable></View>
    </View>
  );
}

function DriverPaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, setDriverStage } = useDraba();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: insets.top + 28, paddingBottom: insets.bottom + 16 }]}>
      <StagePill label="12 · PAYMENT" icon="credit-card" colors={colors} />
      <View style={styles.paymentHero}><View style={[styles.paymentIcon, { backgroundColor: colors.accent }]}><Icon name="arrow-down-left" size={26} color={colors.success} /></View><Text style={[styles.displayTitle, { color: colors.foreground, textAlign: 'center', marginTop: 20 }]}>₦6,540 added.</Text><Text style={[styles.body, { color: colors.mutedForeground, textAlign: 'center', marginTop: 7 }]}>Your wallet has been updated after client confirmation.</Text></View>
      <View style={[styles.paymentBreakdown, { borderColor: colors.border }]}><View style={styles.rowBetween}><Text style={[styles.caption, { color: colors.mutedForeground }]}>Trip fare</Text><Text style={[styles.cardTitle, { color: colors.foreground }]}>₦7,200</Text></View><View style={styles.rowBetween}><Text style={[styles.caption, { color: colors.mutedForeground }]}>Draba service fee</Text><Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>-₦660</Text></View><View style={[styles.divider, { backgroundColor: colors.border }]} /><View style={styles.rowBetween}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Net earnings</Text><Text style={[styles.estimateAmount, { color: colors.success }]}>₦6,540</Text></View></View>
      <View style={styles.bottomCta}><PrimaryButton label="View driver wallet" onPress={() => press(() => { setDriverStage('paid'); setScreen('driverWallet'); })} colors={colors} /><Pressable onPress={() => press(() => setScreen('driverDashboard'))} style={styles.ghostButton}><Text style={[styles.buttonLabel, { color: colors.mutedForeground }]}>Back to dashboard</Text></Pressable></View>
    </View>
  );
}

function DriverTrustScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen } = useDraba();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <PageHeader title="Trust dashboard" subtitle="The standard you set for every client" onBack={() => setScreen('driverDashboard')} colors={colors} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 3, paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.trustDashboardHero}><View style={[styles.trustRing, { borderColor: colors.success }]}><Text style={[styles.trustNumber, { color: colors.foreground }]}>96</Text><Text style={[styles.tinyText, { color: colors.mutedForeground }]}>/100</Text></View><Text style={[styles.authTitleSmall, { color: colors.foreground, marginTop: 17 }]}>Excellent trust score</Text><Text style={[styles.caption, { color: colors.mutedForeground, textAlign: 'center', marginTop: 4 }]}>You’re in the top 13% of active drivers.</Text></View>
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 28 }]}>Score progress</Text>
        <TrustProgress label="Identity verification" value="100%" progress={1} icon="shield" colors={colors} />
        <TrustProgress label="Safe driving" value="98%" progress={0.98} icon="navigation" colors={colors} />
        <TrustProgress label="Client experience" value="96%" progress={0.96} icon="star" colors={colors} />
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 28 }]}>Recommendations</Text>
        <View style={[styles.recommendation, { backgroundColor: colors.input }]}><Icon name="thumbs-up" size={18} color={colors.success} /><View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Keep your response time low</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 3 }]}>You’re only 2 points away from Elite status.</Text></View></View>
        <View style={[styles.recommendation, { backgroundColor: colors.input }]}><Icon name="file-text" size={18} color={colors.primary} /><View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Documents are up to date</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 3 }]}>Next review is due in November 2026.</Text></View></View>
      </ScrollView>
      <DriverBottomNav active="trust" colors={colors} />
    </View>
  );
}

function DriverPerformanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen } = useDraba();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <PageHeader title="Performance" subtitle="Your weekly driver scorecard" onBack={() => setScreen('driverDashboard')} colors={colors} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 2, paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.performanceGrid}><PerformanceMetric label="Acceptance" value="94%" delta="+4.2%" icon="check-circle" colors={colors} /><PerformanceMetric label="Completion" value="98%" delta="+1.8%" icon="flag" colors={colors} /><PerformanceMetric label="Client rating" value="4.9" delta="+0.1" icon="star" colors={colors} /><PerformanceMetric label="On-time" value="96%" delta="+3.5%" icon="clock" colors={colors} /></View>
        <View style={[styles.performanceCallout, { borderColor: colors.border }]}><Icon name="award" size={20} color={colors.warning} /><View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>You’re doing excellent</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 3 }]}>Your strongest metric this week is trip completion.</Text></View></View>
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 29 }]}>Recent feedback</Text>
        <View style={styles.feedbackRow}><View style={[styles.requestClientAvatar, { backgroundColor: colors.accent }]}><Text style={[styles.tinyText, { color: colors.foreground }]}>TO</Text></View><View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>“Calm and professional.”</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 3 }]}>Tobi · Yesterday</Text></View><Text style={[styles.caption, { color: colors.warning }]}>★ 5.0</Text></View>
        <View style={styles.feedbackRow}><View style={[styles.requestClientAvatar, { backgroundColor: colors.primary }]}><Text style={[styles.tinyText, { color: colors.primaryForeground }]}>NA</Text></View><View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>“Arrived right on time.”</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 3 }]}>Nneka · Aug 25</Text></View><Text style={[styles.caption, { color: colors.warning }]}>★ 5.0</Text></View>
      </ScrollView>
      <DriverBottomNav active="performance" colors={colors} />
    </View>
  );
}

function DriverWalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, showToast } = useDraba();
  const driverTransactions = [{ label: 'Trip · Amara Okafor', date: 'Today, 11:24 AM', amount: '+₦6,540' }, { label: 'Trip · Tobi Adeyemi', date: 'Yesterday, 4:08 PM', amount: '+₦5,980' }, { label: 'Withdrawal to bank', date: 'Aug 26, 9:14 AM', amount: '-₦40,000' }];
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <PageHeader title="Driver wallet" subtitle="Your earnings, always within reach" onBack={() => setScreen('driverDashboard')} colors={colors} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 2, paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>AVAILABLE TO WITHDRAW</Text>
        <Text style={[styles.driverWalletAmount, { color: colors.foreground }]}>₦186,420</Text>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>Next payout · Friday, 30 August</Text>
        <Pressable onPress={() => press(() => showToast('Withdrawal flow opened'))} style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 20 }]}><Icon name="download" size={17} color={colors.primaryForeground} /><Text style={[styles.buttonLabel, { color: colors.primaryForeground }]}>Withdraw earnings</Text></Pressable>
        <View style={styles.rowBetween}><Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 32 }]}>Transactions</Text><Text style={[styles.linkText, { color: colors.primary, marginTop: 32 }]}>See all</Text></View>
        {driverTransactions.map((transaction) => <View key={transaction.label} style={[styles.transactionRow, { borderBottomColor: colors.border }]}><View style={[styles.iconCircle, { backgroundColor: transaction.amount.startsWith('+') ? colors.accent : colors.input }]}><Icon name={transaction.amount.startsWith('+') ? 'arrow-down-left' : 'arrow-up-right'} size={16} color={transaction.amount.startsWith('+') ? colors.success : colors.primary} /></View><View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{transaction.label}</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 3 }]}>{transaction.date}</Text></View><Text style={[styles.cardTitle, { color: transaction.amount.startsWith('+') ? colors.success : colors.foreground }]}>{transaction.amount}</Text></View>)}
      </ScrollView>
      <DriverBottomNav active="wallet" colors={colors} />
    </View>
  );
}

function DriverProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setScreen, driverOnline, setDriverOnline, showToast } = useDraba();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <PageHeader title="Driver profile" subtitle="Verification, documents, availability" onBack={() => setScreen('driverDashboard')} colors={colors} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 2, paddingBottom: insets.bottom + 35 }} showsVerticalScrollIndicator={false}>
        <View style={styles.driverProfileHero}><View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}><Text style={[styles.profileInitials, { color: colors.primaryForeground }]}>CN</Text></View><Text style={[styles.displayName, { color: colors.foreground, marginTop: 13 }]}>Chisom Ndudim</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 3 }]}>Professional driver · Lagos Island</Text><View style={[styles.verifiedPill, { backgroundColor: colors.accent }]}><Icon name="check-circle" size={13} color={colors.success} /><Text style={[styles.caption, { color: colors.accentForeground }]}>Fully verified</Text></View></View>
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 28 }]}>Verification</Text>
        <VerificationItem icon="user-check" title="Identity verified" subtitle="Government ID and face match complete" colors={colors} />
        <VerificationItem icon="check-circle" title="Driver’s license" subtitle="Valid until November 2027" colors={colors} />
        <VerificationItem icon="file-text" title="Vehicle documents" subtitle="Insurance and roadworthiness on file" colors={colors} />
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 28 }]}>Availability</Text>
        <View style={[styles.availabilityRow, { borderColor: colors.border }]}><View style={[styles.iconCircle, { backgroundColor: colors.input }]}><Icon name="radio" size={17} color={driverOnline ? colors.success : colors.mutedForeground} /></View><View style={styles.flex}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{driverOnline ? 'Online for requests' : 'Currently offline'}</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 3 }]}>Receive requests around your preferred area</Text></View><Pressable onPress={() => { setDriverOnline(!driverOnline); showToast(driverOnline ? 'You are offline' : 'You are online'); }} style={[styles.toggle, { backgroundColor: driverOnline ? colors.success : colors.input }]}><View style={[styles.toggleKnob, { backgroundColor: colors.foreground, alignSelf: driverOnline ? 'flex-end' : 'flex-start' }]} /></Pressable></View>
        <Pressable onPress={() => press(() => { setScreen('home'); })} style={[styles.switchModeButton, { borderColor: colors.border }]}><Icon name="repeat" size={16} color={colors.primary} /><Text style={[styles.buttonLabel, { color: colors.foreground }]}>Switch to client mode</Text></Pressable>
      </ScrollView>
    </View>
  );
}

function DriverQuickStat({ icon, label, value, onPress, colors }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; onPress: () => void; colors: ReturnType<typeof useColors> }) {
  return <Pressable onPress={() => press(onPress)} style={[styles.driverQuickStat, { borderColor: colors.border }]}><Icon name={icon} size={16} color={colors.primary} /><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 12 }]}>{label}</Text><Text style={[styles.cardTitle, { color: colors.foreground, marginTop: 3 }]}>{value}</Text></Pressable>;
}

function DriverKpi({ label, value, icon, colors }: { label: string; value: string; icon: keyof typeof Feather.glyphMap; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.driverKpi}><Icon name={icon} size={14} color={colors.primary} /><Text style={[styles.tinyText, { color: colors.mutedForeground, marginTop: 6 }]}>{label}</Text><Text style={[styles.cardTitle, { color: colors.foreground, marginTop: 3 }]}>{value}</Text></View>;
}

function RouteRow({ icon, label, value, color, colors }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; color: string; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.routeDetailRow}><Icon name={icon} size={14} color={color} /><View style={styles.flex}><Text style={[styles.caption, { color: colors.mutedForeground }]}>{label}</Text><Text style={[styles.cardTitle, { color: colors.foreground, marginTop: 2 }]}>{value}</Text></View></View>;
}

function StagePill({ label, icon, colors }: { label: string; icon: keyof typeof Feather.glyphMap; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.stagePill, { backgroundColor: colors.accent }]}><Icon name={icon} size={13} color={colors.success} /><Text style={[styles.sectionEyebrow, { color: colors.success }]}>{label}</Text></View>;
}

function TrustProgress({ label, value, progress, icon, colors }: { label: string; value: string; progress: number; icon: keyof typeof Feather.glyphMap; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.trustProgress}><View style={styles.rowBetween}><View style={styles.iconTitleRow}><Icon name={icon} size={15} color={colors.primary} /><Text style={[styles.caption, { color: colors.foreground }]}>{label}</Text></View><Text style={[styles.caption, { color: colors.success }]}>{value}</Text></View><View style={[styles.progressBar, { backgroundColor: colors.input }]}><View style={[styles.progressFill, { backgroundColor: colors.success, width: `${progress * 100}%` }]} /></View></View>;
}

function PerformanceMetric({ label, value, delta, icon, colors }: { label: string; value: string; delta: string; icon: keyof typeof Feather.glyphMap; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.performanceMetric, { borderColor: colors.border }]}><Icon name={icon} size={16} color={colors.primary} /><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 11 }]}>{label}</Text><Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text><Text style={[styles.tinyText, { color: colors.success }]}>{delta} this week</Text></View>;
}

function SwipeAccept({ onAccept, colors }: { onAccept: () => void; colors: ReturnType<typeof useColors> }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== 'web';
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 4,
    onPanResponderMove: (_, gesture) => translateX.setValue(Math.max(0, Math.min(218, gesture.dx))),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 150) {
        Animated.timing(translateX, { toValue: 218, duration: 180, useNativeDriver }).start(onAccept);
      } else {
        Animated.spring(translateX, { toValue: 0, damping: 18, stiffness: 190, useNativeDriver }).start();
      }
    },
  })).current;
  return <View style={[styles.swipeAccept, { backgroundColor: colors.primary }]}><Animated.View {...panResponder.panHandlers} style={[styles.swipeThumb, { backgroundColor: colors.primaryForeground, transform: [{ translateX }] }]}><Icon name="arrow-right" size={19} color={colors.primary} /></Animated.View><Text style={[styles.buttonLabel, { color: colors.primaryForeground }]}>Swipe to accept</Text><Icon name="chevrons-right" size={18} color={colors.primaryForeground} /></View>;
}

function DriverBottomNav({ active, colors }: { active: 'dashboard' | 'trust' | 'performance' | 'wallet'; colors: ReturnType<typeof useColors> }) {
  const insets = useSafeAreaInsets();
  const { setScreen } = useDraba();
  const tabs: Array<{ key: typeof active; label: string; icon: keyof typeof Feather.glyphMap; screen: 'driverDashboard' | 'driverTrust' | 'driverPerformance' | 'driverWallet' }> = [
    { key: 'dashboard', label: 'Home', icon: 'home', screen: 'driverDashboard' },
    { key: 'trust', label: 'Trust', icon: 'shield', screen: 'driverTrust' },
    { key: 'performance', label: 'Stats', icon: 'activity', screen: 'driverPerformance' },
    { key: 'wallet', label: 'Wallet', icon: 'credit-card', screen: 'driverWallet' },
  ];
  return <View style={[styles.bottomNav, { backgroundColor: colors.card, borderColor: colors.border, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 8 }]}>{tabs.map((tab) => <Pressable key={tab.key} onPress={() => press(() => setScreen(tab.screen))} style={styles.navItem} testID={`driver-nav-${tab.key}`}><Icon name={tab.icon} size={19} color={active === tab.key ? colors.primary : colors.mutedForeground} /><Text style={[styles.navLabel, { color: active === tab.key ? colors.primary : colors.mutedForeground }]}>{tab.label}</Text></Pressable>)}<Pressable onPress={() => press(() => setScreen('driverProfile'))} style={styles.navItem} testID="driver-nav-profile"><Icon name="user" size={19} color={colors.mutedForeground} /><Text style={[styles.navLabel, { color: colors.mutedForeground }]}>Profile</Text></Pressable></View>;
}

function PageHeader({ title, subtitle, onBack, colors }: { title: string; subtitle: string; onBack: () => void; colors: ReturnType<typeof useColors> }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.pageHeader, { paddingTop: insets.top + 10 }]}><Pressable onPress={() => press(onBack)} style={styles.backButton}><Icon name="arrow-left" size={20} color={colors.foreground} /></Pressable><View style={styles.flex}><Text style={[styles.authTitleSmall, { color: colors.foreground }]}>{title}</Text><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 2 }]}>{subtitle}</Text></View></View>;
}

function BottomNav({ active, colors }: { active: 'home' | 'trips' | 'wallet' | 'inbox'; colors: ReturnType<typeof useColors> }) {
  const insets = useSafeAreaInsets();
  const { setScreen } = useDraba();
  const tabs: Array<{ key: 'home' | 'trips' | 'wallet' | 'inbox'; label: string; icon: keyof typeof Feather.glyphMap; screen: 'home' | 'trips' | 'wallet' | 'inbox' }> = [
    { key: 'home', label: 'Home', icon: 'home', screen: 'home' },
    { key: 'trips', label: 'Trips', icon: 'clock', screen: 'trips' },
    { key: 'wallet', label: 'Wallet', icon: 'credit-card', screen: 'wallet' },
    { key: 'inbox', label: 'Inbox', icon: 'message-circle', screen: 'inbox' },
  ];
  return <View style={[styles.bottomNav, { backgroundColor: colors.card, borderColor: colors.border, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 8 }]}>{tabs.map((tab) => <Pressable key={tab.key} onPress={() => press(() => setScreen(tab.screen))} style={styles.navItem} testID={`nav-${tab.key}`}><Icon name={tab.icon} size={19} color={active === tab.key ? colors.primary : colors.mutedForeground} /><Text style={[styles.navLabel, { color: active === tab.key ? colors.primary : colors.mutedForeground }]}>{tab.label}</Text></Pressable>)}<Pressable onPress={() => press(() => setScreen('profile'))} style={styles.navItem} testID="nav-profile"><Icon name="user" size={19} color={active === 'home' ? colors.mutedForeground : colors.mutedForeground} /><Text style={[styles.navLabel, { color: colors.mutedForeground }]}>Profile</Text></Pressable></View>;
}

function RoundIconButton({ name, onPress, colors, small = false }: { name: keyof typeof Feather.glyphMap; onPress: () => void; colors: ReturnType<typeof useColors>; small?: boolean }) {
  return <Pressable onPress={onPress} style={[small ? styles.roundIconSmall : styles.roundIcon, { backgroundColor: colors.card, borderColor: colors.border }]}><Icon name={name} size={small ? 15 : 18} color={colors.foreground} /></Pressable>;
}

function QuickAction({ icon, label, onPress, colors }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void; colors: ReturnType<typeof useColors> }) {
  return <Pressable onPress={onPress} style={styles.quickAction}><View style={[styles.iconCircle, { backgroundColor: colors.input }]}><Icon name={icon} size={16} color={colors.primary} /></View><Text style={[styles.tinyText, { color: colors.mutedForeground, marginTop: 7 }]}>{label}</Text></Pressable>;
}

function PrimaryButton({ label, onPress, colors, disabled = false }: { label: string; onPress: () => void; colors: ReturnType<typeof useColors>; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, { backgroundColor: disabled ? colors.input : colors.primary, opacity: pressed ? 0.82 : 1 }]} testID={`button-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}><Text style={[styles.buttonLabel, { color: disabled ? colors.mutedForeground : colors.primaryForeground }]}>{label}</Text><Icon name="arrow-right" size={17} color={disabled ? colors.mutedForeground : colors.primaryForeground} /></Pressable>;
}

function OutlineButton({ label, icon, onPress, colors }: { label: string; icon: keyof typeof Feather.glyphMap; onPress: () => void; colors: ReturnType<typeof useColors> }) {
  return <Pressable onPress={() => press(onPress)} style={[styles.outlineButton, { borderColor: colors.border }]}><Icon name={icon} size={14} color={colors.foreground} /><Text style={[styles.caption, { color: colors.foreground }]}>{label}</Text></Pressable>;
}

function Toast({ message, colors, bottom }: { message: string; colors: ReturnType<typeof useColors>; bottom: number }) {
  return <View style={[styles.toast, { backgroundColor: colors.card, borderColor: colors.border, bottom }]}><Icon name="check-circle" size={17} color={colors.success} /><Text style={[styles.caption, { color: colors.foreground, flex: 1 }]}>{message}</Text></View>;
}

export default function Index() {
  return <App />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  transitionLayer: { ...StyleSheet.absoluteFillObject },
  screen: { flex: 1 },
  driverHeader: { paddingHorizontal: 24, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  earningsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  driverEarnings: { fontSize: 43, fontWeight: '700', letterSpacing: -1.8 },
  changePill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  driverOnlinePanel: { marginTop: 26, borderBottomWidth: 1, paddingBottom: 18 },
  iconTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  driverStatusDot: { width: 10, height: 10, borderRadius: 5 },
  goOnlineButton: { height: 49, borderRadius: 15, marginTop: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  trustSummary: { marginTop: 12, borderBottomWidth: 1, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  trustScoreBadge: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  trustScoreValue: { fontSize: 22, fontWeight: '700' },
  driverQuickGrid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  driverQuickStat: { flex: 1, minHeight: 99, borderBottomWidth: 1, paddingVertical: 13 },
  scheduleHint: { marginTop: 22, borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  driverOverlayHeader: { position: 'absolute', top: 0, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  driverWaitingSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 13, minHeight: SCREEN_HEIGHT * 0.37 },
  driverSheetTitle: { fontSize: 24, fontWeight: '700', letterSpacing: -0.6, marginTop: 5 },
  demandStats: { flexDirection: 'row', gap: 8, marginTop: 20 },
  driverKpi: { flex: 1, minWidth: 0 },
  driverKpiRow: { flexDirection: 'row', gap: 5, paddingTop: 15 },
  countdownPill: { borderRadius: 11, paddingHorizontal: 9, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  requestHero: { borderRadius: 18, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 11 },
  requestClientAvatar: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  requestDetails: { marginTop: 12, borderBottomWidth: 1, paddingVertical: 16 },
  requestNote: { marginTop: 18, borderBottomWidth: 1, paddingBottom: 15, flexDirection: 'row', gap: 8 },
  routeDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  stagePill: { alignSelf: 'flex-start', borderRadius: 11, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 6 },
  acceptedHero: { alignItems: 'center', paddingTop: 27 },
  etaCircle: { width: 107, height: 107, borderRadius: 54, borderWidth: 5, alignItems: 'center', justifyContent: 'center' },
  etaNumber: { fontSize: 35, fontWeight: '700', letterSpacing: -1 },
  routeSummary: { marginTop: 27, borderBottomWidth: 1, paddingBottom: 12 },
  driverTripSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 17 },
  etaBlock: { alignItems: 'flex-end' },
  etaNumberSmall: { fontSize: 26, fontWeight: '700', letterSpacing: -0.7 },
  navigationHint: { marginTop: 17, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  arrivedContent: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 24 },
  waitingIcon: { width: 78, height: 78, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: 46 },
  waitTimer: { fontSize: 42, fontWeight: '700', letterSpacing: -1, marginTop: 28 },
  clientNotified: { width: '100%', borderBottomWidth: 1, paddingVertical: 13, marginTop: 26, flexDirection: 'row', alignItems: 'center', gap: 9 },
  paymentHero: { alignItems: 'center', paddingTop: 50 },
  paymentIcon: { width: 70, height: 70, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  paymentBreakdown: { borderBottomWidth: 1, paddingVertical: 17, gap: 14, marginTop: 32 },
  trustDashboardHero: { alignItems: 'center', paddingTop: 16 },
  trustProgress: { marginTop: 19 },
  progressBar: { height: 6, borderRadius: 3, marginTop: 9, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  recommendation: { marginTop: 11, borderRadius: 15, padding: 13, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  performanceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  performanceMetric: { width: '48%', minHeight: 126, borderBottomWidth: 1, paddingVertical: 13 },
  metricValue: { fontSize: 25, fontWeight: '700', letterSpacing: -0.5, marginTop: 8, marginBottom: 2 },
  performanceCallout: { marginTop: 22, borderBottomWidth: 1, paddingVertical: 15, flexDirection: 'row', gap: 10 },
  feedbackRow: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#294355', flexDirection: 'row', alignItems: 'center', gap: 10 },
  driverWalletAmount: { fontSize: 38, fontWeight: '700', letterSpacing: -1.4, marginTop: 9 },
  driverProfileHero: { alignItems: 'center', paddingTop: 6 },
  availabilityRow: { borderBottomWidth: 1, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggle: { width: 48, height: 28, borderRadius: 15, padding: 3, justifyContent: 'center' },
  toggleKnob: { width: 22, height: 22, borderRadius: 11 },
  switchModeButton: { marginTop: 26, borderWidth: 1, borderRadius: 15, height: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  swipeAccept: { height: 58, borderRadius: 17, marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden' },
  swipeThumb: { position: 'absolute', left: 5, top: 5, width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 22, fontWeight: '700', letterSpacing: 3, marginTop: 18 },
  brandSmall: { fontSize: 15, fontWeight: '700', letterSpacing: 2.5 },
  tagline: { fontSize: 13, marginTop: 5 },
  logoShield: { width: 70, height: 70, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  logoCheck: { position: 'absolute', right: 9, bottom: 9, width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  welcomeTop: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24 },
  miniLogo: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  welcomeHero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroOrb: { position: 'absolute', width: 260, height: 260, borderRadius: 150, opacity: 0.38 },
  heroCard: { width: SCREEN_WIDTH * 0.72, height: SCREEN_WIDTH * 0.96, borderRadius: 34, padding: 8, borderWidth: 1, transform: [{ rotate: '-6deg' }] },
  heroImagePlaceholder: { flex: 1, borderRadius: 27, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  heroRoad: { width: 260, height: 92, borderRadius: 50, transform: [{ rotate: '35deg' }] },
  heroCar: { position: 'absolute', width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }] },
  heroBadge: { position: 'absolute', bottom: 20, left: 18, right: 18, padding: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  welcomeCopy: { paddingHorizontal: 24, paddingBottom: 22 },
  displayTitle: { fontSize: 31, fontWeight: '700', lineHeight: 37, letterSpacing: -0.8 },
  displayName: { fontSize: 21, fontWeight: '700', letterSpacing: -0.3 },
  body: { fontSize: 14, lineHeight: 21 },
  bottomCta: { paddingHorizontal: 24, gap: 12 },
  primaryButton: { minHeight: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonLabel: { fontSize: 15, fontWeight: '600' },
  ghostButton: { alignItems: 'center', paddingVertical: 11 },
  terms: { fontSize: 11, lineHeight: 17, textAlign: 'center', paddingHorizontal: 16 },
  backButton: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  authTitle: { fontSize: 31, fontWeight: '700', letterSpacing: -0.8, marginTop: 30, marginBottom: 7 },
  authTitleSmall: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  authForm: { flex: 1, paddingTop: 48 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  inputRow: { minHeight: 56, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  countryCode: { fontSize: 15, fontWeight: '600', paddingRight: 14, borderRightWidth: 1, borderRightColor: '#294355' },
  textInput: { flex: 1, fontSize: 16, paddingHorizontal: 14, minHeight: 52 },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 13 },
  caption: { fontSize: 12, lineHeight: 17 },
  tinyText: { fontSize: 10, lineHeight: 14 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  otpInput: { width: (SCREEN_WIDTH - 72) / 6, height: 56, borderRadius: 14, borderWidth: 1, textAlign: 'center', fontSize: 20, fontWeight: '600' },
  verifyList: { flex: 1, paddingTop: 42, gap: 12 },
  verifyItem: { padding: 15, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  verifyIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  mapScreen: { flex: 1, overflow: 'hidden' },
  mapBase: { ...StyleSheet.absoluteFillObject, opacity: 0.95 },
  mapRoadHorizontal: { position: 'absolute', height: 1, left: -20, right: -20, transform: [{ rotate: '-7deg' }] },
  mapRoadVertical: { position: 'absolute', width: 1, top: -30, bottom: -30, transform: [{ rotate: '18deg' }] },
  mapDistrict: { position: 'absolute', width: 158, height: 120, borderWidth: 1, borderRadius: 25, transform: [{ rotate: '-11deg' }] },
  mapSvg: { position: 'absolute', top: 90, left: 0 },
  mapHeader: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerName: { fontSize: 21, fontWeight: '700', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  roundIcon: { width: 42, height: 42, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  roundIconSmall: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700' },
  mapSearch: { position: 'absolute', left: 20, right: 20, borderRadius: 17, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchPlaceholder: { fontSize: 14, fontWeight: '600' },
  searchSubtext: { fontSize: 10, marginTop: 3 },
  locateButton: { position: 'absolute', right: 20, width: 44, height: 44, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  homeSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: SCREEN_HEIGHT * 0.31, paddingHorizontal: 20, paddingTop: 12 },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  sectionEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.3 },
  destinationCard: { marginTop: 11, borderBottomWidth: 1, paddingVertical: 14, flexDirection: 'row', alignItems: 'center' },
  routeDot: { width: 9, height: 9, borderRadius: 5, marginRight: 12 },
  routeLine: { position: 'absolute', left: 18, top: 28, height: 25, width: 1, backgroundColor: '#294355' },
  routeLabels: { flex: 1 },
  routeGap: { height: 8 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14 },
  quickAction: { alignItems: 'center', width: '31%' },
  iconCircle: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  driverMarker: { position: 'absolute', width: 38, height: 38, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  markerText: { fontSize: 10, fontWeight: '700' },
  youMarker: { position: 'absolute', width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  searchHeader: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInputLarge: { margin: 20, marginBottom: 24, minHeight: 56, borderRadius: 17, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 19, fontWeight: '700', letterSpacing: -0.3 },
  currentLocation: { marginHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  suggestionRow: { marginHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1B3446', flexDirection: 'row', alignItems: 'center', gap: 12 },
  compactHeader: { paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  linkText: { fontSize: 13, fontWeight: '600' },
  driverMap: { height: SCREEN_HEIGHT * 0.29, overflow: 'hidden' },
  driverList: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterPill: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  driverCard: { borderBottomWidth: 1, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverPhoto: { width: 56, height: 70, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  driverInitials: { fontSize: 17, fontWeight: '700' },
  onlineDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, right: -2, top: -2, borderWidth: 2 },
  driverInfo: { flex: 1, gap: 7 },
  premiumBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 3 },
  badgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.6 },
  driverStats: { flexDirection: 'row', gap: 9 },
  trustLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  priceText: { fontSize: 14, fontWeight: '700' },
  featureDriver: { borderBottomWidth: 1, paddingBottom: 24, alignItems: 'center' },
  largePhoto: { width: 94, height: 108, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  largeInitials: { fontSize: 27, fontWeight: '700' },
  centerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  trustScorePill: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 12, marginTop: 15, flexDirection: 'row', alignItems: 'center', gap: 6 },
  estimateCard: { borderBottomWidth: 1, paddingVertical: 16, marginTop: 12, gap: 15 },
  estimateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divider: { height: 1, marginVertical: 1 },
  estimateAmount: { fontSize: 17, fontWeight: '700' },
  paymentHint: { flexDirection: 'row', gap: 7, alignItems: 'center', marginTop: 15 },
  fixedCta: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 12 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000099' },
  trustModal: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 12 },
  modalHandleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  trustHero: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 18 },
  trustRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 5, alignItems: 'center', justifyContent: 'center' },
  trustNumber: { fontSize: 26, fontWeight: '700' },
  trustGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 20 },
  metric: { width: '48%', borderBottomWidth: 1, paddingVertical: 12, gap: 6 },
  trustNote: { borderRadius: 15, borderWidth: 1, padding: 12, flexDirection: 'row', gap: 9, marginVertical: 17 },
  trackingTop: { position: 'absolute', top: 0, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  livePill: { borderRadius: 13, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pulseDot: { width: 7, height: 7, borderRadius: 4 },
  trackingCard: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 16 },
  progressTrack: { flexDirection: 'row', gap: 5 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  trackingDriver: { borderBottomWidth: 1, paddingVertical: 12, marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  driverPhotoSmall: { width: 45, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  driverInitialsSmall: { fontSize: 14, fontWeight: '700' },
  tripActions: { flexDirection: 'row', gap: 8, marginTop: 13 },
  outlineButton: { flex: 1, borderWidth: 1, borderRadius: 12, height: 37, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  cancelTrip: { alignItems: 'center', paddingTop: 15 },
  completeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  completeHero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successCircle: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
  receiptCard: { borderBottomWidth: 1, paddingVertical: 17, gap: 14 },
  ratingWrap: { paddingTop: 24 },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 12 },
  pageHeader: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 9 },
  upcomingCard: { borderBottomWidth: 1, paddingVertical: 18, minHeight: 157 },
  smallCta: { alignSelf: 'flex-start', marginTop: 16, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 9, flexDirection: 'row', gap: 7, alignItems: 'center' },
  tripRow: { paddingVertical: 17, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  balanceCard: { borderBottomWidth: 1, paddingVertical: 19, minHeight: 197 },
  balanceAmount: { fontSize: 34, fontWeight: '700', letterSpacing: -1, marginTop: 20, marginBottom: 5 },
  walletActions: { flexDirection: 'row', gap: 9, marginTop: 20 },
  walletAction: { borderRadius: 11, paddingHorizontal: 11, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  transactionRow: { paddingVertical: 15, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 11 },
  messageRow: { paddingVertical: 14, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  unreadDot: { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
  emptySafety: { alignItems: 'center', padding: 30, marginTop: 15 },
  profileHero: { alignItems: 'center', paddingVertical: 14 },
  profileAvatar: { width: 82, height: 82, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  profileInitials: { fontSize: 25, fontWeight: '700' },
  verifiedPill: { borderRadius: 11, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 11 },
  profileRows: { marginTop: 19 },
  profileRow: { minHeight: 62, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  signOutButton: { marginTop: 25, height: 48, borderWidth: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  bottomNav: { position: 'absolute', bottom: 0, left: 12, right: 12, borderRadius: 22, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 11, shadowColor: '#000000', shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
  navItem: { alignItems: 'center', gap: 4, minWidth: 52 },
  navLabel: { fontSize: 10, fontWeight: '600' },
  toast: { position: 'absolute', left: 20, right: 20, borderWidth: 1, borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 9, shadowColor: '#000000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 9 },
});