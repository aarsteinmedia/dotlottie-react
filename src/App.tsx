import { useRef } from 'react'

import DotLottiePlayer, { type DotLottieMethods } from '@/index'

function App() {
  const animation = useRef<DotLottieMethods>(null)

  return (
    <>
      <header>
        <div className="header-inner">
          <h1 style={{ margin: '0' }}>dotlottie-react</h1>
          <form id="preview">
            <label>
              Choose renderer:<br />
              <select name="renderer" defaultValue={'svg'}>
                <option value="svg">SVG</option>
                <option value="canvas">Canvas</option>
                <option disabled value="html">HTML</option>
              </select>
            </label>
            <label>
              Select file to preview:<br />
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <select autoFocus name="path">
                <option disabled value="assets/am.lottie">Path to file</option>
              </select>
            </label>
          </form>
        </div>
      </header>
      <div style={{
        margin: '40px auto',
        maxWidth: '800px',
        width: '80%'
      }}>
        <div id="container"
          style={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            gap: '1em',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
          <DotLottiePlayer animateOnScroll subframe src="/strengths.json" ref={animation} onMouseEnter={() => animation.current?.play} />
        </div>

        <div style={{
          margin: '40px auto',
          maxWidth: '600px',
          width: '80%'
        }}>
          <h2>Lorem ipsum</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
      </div>
    </>
  )
}

export default App
