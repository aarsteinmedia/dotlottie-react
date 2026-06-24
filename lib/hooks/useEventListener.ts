/* eslint-disable fsecond/valid-event-listener */
import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import { isServer } from '@aarsteinmedia/lottie-web/utils'
import { useEffect, useRef } from 'react'

export type EventHandler<E extends Event = Event> = (event: E) => void

interface ElementOptions<T> {
  element?:
  | (Window & typeof globalThis)
  | React.RefObject<T>
  | Element
  | ScreenOrientation
  | Document
  | null
  | false
}

type EventOptions<T> = EventListenerOptions &
  AddEventListenerOptions & ElementOptions<T>

/**
 * `useEventListener` is a custom React hook that adds an event listener to a specified element.
 * It simplifies the process of handling events by managing the event listener and callback function.
 *
 * @param eventType - The type of event to listen for.
 * @param callback - The function to execute when the event occurs.
 * @param options - The element to add the event listener to. Default is the window.
 */

export function useEventListener<
  E extends Event = Event,
  T extends Element | AnimationItem | null = Element,
>(
  eventType: string,
  callback: EventHandler<E>,
  options: EventOptions<T>
) {

  const element =
    !options.element && !isServer ? window : options.element

  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {

    const targetElement =
      element && 'current' in element
        ? element.current
        : element

    if (!targetElement) {
      return
    }

    const handler = ((e: E) => {
      callbackRef.current(e)
    }) as EventListener

    /* AnimationItem::addEventListener is not directly compatible
    with standard Element::addEventListener, but not in a way that
    will cause trouble */
    ;(targetElement as Window).addEventListener(
      eventType, handler, options
    )

    return () => {
      ;(targetElement as Window).removeEventListener(
        eventType,
        handler,
        options
      )
    }
  }, [
    eventType,
    element,
    options
  ])
}
