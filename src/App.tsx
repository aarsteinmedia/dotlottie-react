import { PlayMode } from '@/enums'
import DotLottiePlayer from '@/light'

function App() {
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
          <DotLottiePlayer
            autoplay
            loop
            // animateOnScroll
            subframe
            controls
            // direction={-1}
            className="test"
            src="/dev.lottie"
          />
        </div>

        <div style={{
          margin: '40px auto',
          maxWidth: '600px',
          width: '80%'
        }}>
          <h2>Lorem ipsum</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <div className='alignleft' style={{ width: '100%' }} >
            <DotLottiePlayer animateOnScroll subframe src="/care-education-combined.lottie" />
          </div>
          <div className='alignright' style={{ width: '100%' }} >
            <DotLottiePlayer autoplay loop subframe description='Synnøve Finden hopper og spretter!' mode={PlayMode.Bounce} src="/synnove.lottie" />
          </div>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
      </div>
    </>
  )
}

export default App
