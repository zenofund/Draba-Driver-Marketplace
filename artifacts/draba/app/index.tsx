import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  Modal,
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
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fade, screen]);

  useEffect(() => {
    if (screen !== 'splash') return;
    const timer = setTimeout(() => setScreen('welcome'), 1200);
    return () => clearTimeout(timer);
  }, [screen, setScreen]);

  useEffect(() => {
    if (screen !== 'tracking') return;
    const stages: Array<'searching' | 'accepted' | 'arriving' | 'started' | 'completed'> = ['searching', 'accepted', 'arriving', 'started', 'completed'];
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
    <ProfileScreen />;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.flex, { opacity: fade }]}>
        {screenContent}
      </Animated.View>
      {toast ? <Toast message={toast} colors={colors} bottom={insets.bottom + 92} /> : null}
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
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.heroImagePlaceholder, { backgroundColor: colors.map }]}>
            <View style={[styles.heroRoad, { backgroundColor: colors.mapLine }]} />
            <View style={[styles.heroCar, { backgroundColor: colors.primary }]}>
              <Icon name="navigation" size={18} color={colors.primaryForeground} />
            </View>
            <View style={[styles.heroBadge, { backgroundColor: colors.card }]}>
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
    <View style={[styles.verifyItem, { borderColor: colors.border, backgroundColor: colors.card }]}>
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
        <Pressable onPress={() => press(() => setScreen('search'))} style={[styles.destinationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
        <Pressable onPress={() => { setDestination('Current location'); setQuery('Current location'); }} style={[styles.currentLocation, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
    <Pressable onPress={onPress} style={({ pressed }) => [styles.driverCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.84 : 1 }]}>
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
        <View style={[styles.featureDriver, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.largePhoto, { backgroundColor: selectedDriver.accent }]}><Text style={[styles.largeInitials, { color: colors.foreground }]}>{selectedDriver.initials}</Text></View>
          <Text style={[styles.displayName, { color: colors.foreground }]}>{selectedDriver.name}</Text>
          <View style={styles.centerRow}><Text style={[styles.caption, { color: colors.warning }]}>★ {selectedDriver.rating}</Text><Text style={[styles.caption, { color: colors.mutedForeground }]}> · {selectedDriver.trips} completed trips</Text></View>
          <Pressable onPress={() => press(() => setTrustOpen(true))} style={[styles.trustScorePill, { backgroundColor: colors.accent }]}>
            <Icon name="shield" size={16} color={colors.success} /><Text style={[styles.cardTitle, { color: colors.accentForeground }]}>Trust score {selectedDriver.trust}%</Text><Icon name="chevron-right" size={15} color={colors.accentForeground} />
          </Pressable>
          <Text style={[styles.body, { color: colors.mutedForeground, textAlign: 'center', marginTop: 16 }]}>{selectedDriver.bio}</Text>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 26 }]}>Trip estimate</Text>
        <View style={[styles.estimateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
          <View style={[styles.trustNote, { backgroundColor: colors.card, borderColor: colors.border }]}><Icon name="shield" size={17} color={colors.success} /><Text style={[styles.caption, { color: colors.mutedForeground, flex: 1 }]}>Verified by Draba with identity, license, and face verification. {driver.trips} successful trips.</Text></View>
          <PrimaryButton label="Done" onPress={onClose} colors={colors} />
        </View>
      </View>
    </Modal>
  );
}

function TrustMetric({ label, value, icon, colors }: { label: string; value: string; icon: keyof typeof Feather.glyphMap; colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.metric, { backgroundColor: colors.card, borderColor: colors.border }]}><Icon name={icon} size={16} color={colors.primary} /><Text style={[styles.tinyText, { color: colors.mutedForeground }]}>{label}</Text><Text style={[styles.cardTitle, { color: colors.foreground }]}>{value}</Text></View>;
}

function TrackingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { selectedDriver, tripStage, setScreen, showToast } = useDraba();
  const stageCopy = {
    searching: ['Searching for the best driver', 'The usually takes less than 30 seconds.'],
    accepted: [`${selectedDriver.name} accepted`, 'Your driver is on the way.'],
    arriving: ['Your driver is arriving', `${selectedDriver.name} is 2 minutes away.`],
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
        <View style={styles.progressTrack}>{['searching', 'accepted', 'arriving', 'started'].map((stage, index) => <View key={stage} style={[styles.progressSegment, { backgroundColor: ['searching', 'accepted', 'arriving', 'started'].indexOf(tripStage) >= index ? colors.primary : colors.input }]} />)}</View>
        <Text style={[styles.authTitleSmall, { color: colors.foreground, marginTop: 20 }]}>{stageCopy[0]}</Text>
        <Text style={[styles.body, { color: colors.mutedForeground, marginTop: 6 }]}>{stageCopy[1]}</Text>
        <View style={[styles.trackingDriver, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
      <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.rowBetween}><Text style={[styles.caption, { color: colors.mutedForeground }]}>Trip fare</Text><Text style={[styles.cardTitle, { color: colors.foreground }]}>₦7,200</Text></View><View style={styles.rowBetween}><Text style={[styles.caption, { color: colors.mutedForeground }]}>Payment method</Text><Text style={[styles.caption, { color: colors.foreground }]}>Visa · 4242</Text></View><View style={[styles.divider, { backgroundColor: colors.border }]} /><View style={styles.rowBetween}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Total paid</Text><Text style={[styles.estimateAmount, { color: colors.success }]}>₦7,200</Text></View></View>
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
        <View style={[styles.upcomingCard, { backgroundColor: colors.accent, borderColor: colors.accent }]}><View style={styles.rowBetween}><View><Text style={[styles.sectionEyebrow, { color: colors.accentForeground }]}>UPCOMING</Text><Text style={[styles.cardTitle, { color: colors.foreground, marginTop: 6 }]}>Plan a safe trip</Text></View><Icon name="calendar" size={20} color={colors.accentForeground} /></View><Text style={[styles.caption, { color: colors.accentForeground, marginTop: 16 }]}>Book a verified driver whenever you need one.</Text><Pressable onPress={() => press(() => setScreen('search'))} style={[styles.smallCta, { backgroundColor: colors.foreground }]}><Text style={[styles.caption, { color: colors.background }]}>Book a driver</Text><Icon name="arrow-up-right" size={14} color={colors.background} /></Pressable></View>
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
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}><View style={styles.rowBetween}><Text style={[styles.caption, { color: colors.primaryForeground, opacity: 0.8 }]}>AVAILABLE BALANCE</Text><Icon name="more-horizontal" size={19} color={colors.primaryForeground} /></View><Text style={[styles.balanceAmount, { color: colors.primaryForeground }]}>₦38,420</Text><Text style={[styles.caption, { color: colors.primaryForeground, opacity: 0.8 }]}>•••• 4242 · Paystack secured</Text><View style={styles.walletActions}><Pressable onPress={() => press(() => showToast('Top up flow opened'))} style={[styles.walletAction, { backgroundColor: colors.primaryForeground }]}><Icon name="plus" size={16} color={colors.primary} /><Text style={[styles.caption, { color: colors.primary }]}>Top up</Text></Pressable><Pressable onPress={() => press(() => showToast('Payment methods opened'))} style={[styles.walletAction, { backgroundColor: colors.primaryForeground + '33' }]}><Icon name="credit-card" size={16} color={colors.primaryForeground} /><Text style={[styles.caption, { color: colors.primaryForeground }]}>Methods</Text></Pressable></View></View>
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
        {messages.map((message) => <Pressable key={message.id} onPress={() => press(() => showToast('Message marked as read'))} style={[styles.messageRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.iconCircle, { backgroundColor: message.unread ? colors.accent : colors.input }]}><Icon name={message.icon as keyof typeof Feather.glyphMap} size={17} color={message.unread ? colors.success : colors.mutedForeground} /></View><View style={styles.flex}><View style={styles.rowBetween}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{message.title}</Text><Text style={[styles.tinyText, { color: colors.mutedForeground }]}>{message.time}</Text></View><Text style={[styles.caption, { color: colors.mutedForeground, marginTop: 4 }]}>{message.body}</Text></View>{message.unread ? <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} /> : null}</Pressable>)}
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
  screen: { flex: 1 },
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
  homeSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: SCREEN_HEIGHT * 0.31, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12 },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  sectionEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.3 },
  destinationCard: { marginTop: 11, borderRadius: 17, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center' },
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
  currentLocation: { marginHorizontal: 20, padding: 14, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  suggestionRow: { marginHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1B3446', flexDirection: 'row', alignItems: 'center', gap: 12 },
  compactHeader: { paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  linkText: { fontSize: 13, fontWeight: '600' },
  driverMap: { height: SCREEN_HEIGHT * 0.29, overflow: 'hidden' },
  driverList: { flex: 1, borderTopLeftRadius: 27, borderTopRightRadius: 27, paddingHorizontal: 20, paddingTop: 20 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterPill: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  driverCard: { borderRadius: 19, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverPhoto: { width: 56, height: 70, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  driverInitials: { fontSize: 17, fontWeight: '700' },
  onlineDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, right: -2, top: -2, borderWidth: 2 },
  driverInfo: { flex: 1, gap: 7 },
  premiumBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 3 },
  badgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.6 },
  driverStats: { flexDirection: 'row', gap: 9 },
  trustLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  priceText: { fontSize: 14, fontWeight: '700' },
  featureDriver: { borderRadius: 24, borderWidth: 1, padding: 20, alignItems: 'center' },
  largePhoto: { width: 94, height: 108, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  largeInitials: { fontSize: 27, fontWeight: '700' },
  centerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  trustScorePill: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 12, marginTop: 15, flexDirection: 'row', alignItems: 'center', gap: 6 },
  estimateCard: { borderRadius: 19, borderWidth: 1, padding: 16, marginTop: 12, gap: 15 },
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
  metric: { width: '48%', borderRadius: 15, borderWidth: 1, padding: 12, gap: 6 },
  trustNote: { borderRadius: 15, borderWidth: 1, padding: 12, flexDirection: 'row', gap: 9, marginVertical: 17 },
  trackingTop: { position: 'absolute', top: 0, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  livePill: { borderRadius: 13, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  pulseDot: { width: 7, height: 7, borderRadius: 4 },
  trackingCard: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 16 },
  progressTrack: { flexDirection: 'row', gap: 5 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  trackingDriver: { borderRadius: 17, borderWidth: 1, padding: 12, marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  driverPhotoSmall: { width: 45, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  driverInitialsSmall: { fontSize: 14, fontWeight: '700' },
  tripActions: { flexDirection: 'row', gap: 8, marginTop: 13 },
  outlineButton: { flex: 1, borderWidth: 1, borderRadius: 12, height: 37, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  cancelTrip: { alignItems: 'center', paddingTop: 15 },
  completeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  completeHero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successCircle: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
  receiptCard: { borderRadius: 18, borderWidth: 1, padding: 17, gap: 14 },
  ratingWrap: { paddingTop: 24 },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 12 },
  pageHeader: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 9 },
  upcomingCard: { borderRadius: 21, padding: 18, minHeight: 157 },
  smallCta: { alignSelf: 'flex-start', marginTop: 16, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 9, flexDirection: 'row', gap: 7, alignItems: 'center' },
  tripRow: { paddingVertical: 17, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  balanceCard: { borderRadius: 23, padding: 19, minHeight: 197 },
  balanceAmount: { fontSize: 34, fontWeight: '700', letterSpacing: -1, marginTop: 20, marginBottom: 5 },
  walletActions: { flexDirection: 'row', gap: 9, marginTop: 20 },
  walletAction: { borderRadius: 11, paddingHorizontal: 11, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  transactionRow: { paddingVertical: 15, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 11 },
  messageRow: { padding: 14, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 11, marginBottom: 10 },
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