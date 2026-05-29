/** Shared mobile-first styles for editor panel */
export const editorTouch =
	'min-h-11 touch-manipulation active:scale-[0.98] transition-transform'

export const editorTouchSm =
	'min-h-11 sm:min-h-9 touch-manipulation active:scale-[0.98] transition-transform'

/** Compact controls for dense mobile toolbars (still ~36px tap target) */
export const editorTouchCompact =
	'h-9 min-h-9 px-2.5 text-xs sm:min-h-9 sm:h-9 sm:px-3 sm:text-sm touch-manipulation active:scale-[0.98] transition-transform'

export const editorMainPadding =
	'pb-[max(5.75rem,env(safe-area-inset-bottom,0px))] md:pb-8'

export const editorHorizontalScroll =
	'flex gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 -mx-1 px-1 snap-x snap-mandatory scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'

export const editorSnapItem = 'snap-start shrink-0'
