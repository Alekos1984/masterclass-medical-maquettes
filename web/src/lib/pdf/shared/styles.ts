import { StyleSheet, Font } from "@react-pdf/renderer";

Font.registerHyphenationCallback((word) => [word]);

export const RED = "#C8102E";
export const BLACK = "#0F0F0F";
export const GRAY = "#6A6A6A";
export const LIGHT_GRAY = "#EBEBEB";
export const OFF_WHITE = "#F9F7F4";
export const WHITE = "#FFFFFF";

export const base = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: BLACK,
    backgroundColor: WHITE,
    paddingTop: 48,
    paddingBottom: 60,
    paddingHorizontal: 48,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: RED,
  },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: "flex-end" },
  logoMark: {
    width: 36,
    height: 36,
    backgroundColor: RED,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { fontSize: 14, fontFamily: "Helvetica-Bold", color: BLACK, marginTop: 6 },
  logoSub: { fontSize: 7, color: GRAY, textTransform: "uppercase", letterSpacing: 1 },
  companyInfo: { fontSize: 8, color: GRAY, lineHeight: 1.5, textAlign: "right" },
  declarationBadge: {
    backgroundColor: OFF_WHITE,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 6,
    fontSize: 7,
    color: GRAY,
  },
  // Title block
  docTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  docSubtitle: { fontSize: 11, color: GRAY, marginBottom: 24 },
  // Section
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: RED,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 20,
  },
  // Divider
  divider: { height: 1, backgroundColor: LIGHT_GRAY, marginVertical: 12 },
  // Info row
  infoRow: { flexDirection: "row", marginBottom: 6 },
  infoLabel: { width: 130, fontSize: 9, color: GRAY },
  infoValue: { flex: 1, fontSize: 9, color: BLACK },
  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: LIGHT_GRAY,
  },
  footerText: { fontSize: 7, color: GRAY },
  // Pill badge
  pill: {
    backgroundColor: OFF_WHITE,
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 10,
    fontSize: 8,
    color: GRAY,
    marginRight: 6,
  },
  pillRed: {
    backgroundColor: "#fff0f2",
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 10,
    fontSize: 8,
    color: RED,
    marginRight: 6,
  },
  // Signature box
  signatureBox: {
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 6,
    padding: 12,
    height: 80,
    justifyContent: "flex-end",
  },
  signatureLabel: { fontSize: 8, color: GRAY },
});
