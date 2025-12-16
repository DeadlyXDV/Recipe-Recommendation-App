import { StyleSheet } from 'react-native';
import { theme } from '../theme';

export const globalStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[8],
  },

  // Buttons
  buttonPrimary: {
    backgroundColor: theme.colors.orange500,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.sm,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.orange300,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.sm,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  buttonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.background,
  },
  buttonSecondaryText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.orange700,
  },

  // Cards
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.orange200,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  cardHeader: {
    padding: theme.spacing[6],
    gap: theme.spacing[2],
  },
  cardContent: {
    padding: theme.spacing[6],
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.orange900,
    lineHeight: theme.typography.fontSize.xl * theme.typography.lineHeight.normal,
  },

  // Badges
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing[1],
  },
  badgeOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.orange300,
  },
  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.orange700,
  },
  badgeGreen: {
    backgroundColor: theme.colors.green100,
  },
  badgeGreenText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.green700,
  },
  badgeYellow: {
    backgroundColor: theme.colors.yellow100,
  },
  badgeYellowText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.yellow700,
  },
  badgeRed: {
    backgroundColor: theme.colors.red100,
  },
  badgeRedText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.red700,
  },

  // Inputs
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 9,
    height: 36,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
  },
  inputFocused: {
    borderColor: theme.colors.orange500,
  },

  // Ingredient Pills
  ingredientPill: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    backgroundColor: theme.colors.orange50,
    borderWidth: 1,
    borderColor: theme.colors.orange200,
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  ingredientPillText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.orange700,
    textTransform: 'capitalize',
  },

  // Score Badge
  scoreBadge: {
    position: 'absolute',
    top: theme.spacing[4],
    right: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing[2],
    ...theme.shadows.lg,
  },
  scoreBadgeText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.background,
  },

  // Text Styles
  headingLarge: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.orange900,
    lineHeight: theme.typography.fontSize['2xl'] * theme.typography.lineHeight.normal,
  },
  headingMedium: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.orange900,
    lineHeight: theme.typography.fontSize.xl * theme.typography.lineHeight.normal,
  },
  bodyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.foreground,
    lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
  },
  mutedText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
  },

  // Recipe Image
  recipeImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  recipeImageLarge: {
    width: '100%',
    height: 300,
  },
});
