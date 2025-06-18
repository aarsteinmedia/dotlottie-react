/* eslint-disable fsecond/valid-event-listener */
import type { AnimationItem } from '@aarsteinmedia/lottie-web'

import { isServer } from '@aarsteinmedia/lottie-web/utils'
import { useEffect, useRef } from 'react'

export type EventHandler<E extends Event = Event> = (event: E) => void

/**
 * `useEventListener` is a custom React hook that adds an event listener to a specified element.
 * It simplifies the process of handling events by managing the event listener and callback function.
 *
 * @param eventType - The type of event to listen for.
 * @param callback - The function to execute when the event occurs.
 * @param options - The element to add the event listener to. Default is the window.
 */
export default function useEventListener<
  E extends Event = Event,
  T extends Element | AnimationItem | null = Element,
>(
  eventType: string,
  callback: EventHandler<E>,
  options: EventListenerOptions &
    AddEventListenerOptions & {
      element?:
        | React.RefObject<T>
        | Element
        | null
        | false
      document?: boolean
    }
) {

  const callbackRef = useRef(callback),
    targetElement = useRef<Element | AnimationItem | Document | Window | null>(null)

  if (!options.element && !isServer) {
    targetElement.current = window
  }

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {

    if (options.document) {
      targetElement.current = document
    } else if (options.element) {
      if ('current' in options.element) {
        targetElement.current = options.element.current
      } else {
        targetElement.current = options.element
      }
    }

    if (!targetElement.current) {
      return
    }

    const handler = (e: E) => {
      callbackRef.current(e)
    }

    // @ts-expect-error: TODO:
    targetElement.current.addEventListener(
      eventType, handler as EventListener, options
    )

    return () => {
      // @ts-expect-error: TODO:
      targetElement.current?.removeEventListener(
        eventType,
        handler as EventListener,
        options
      )
    }
  }, [eventType, options])
}
