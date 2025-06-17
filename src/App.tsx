import DotLottiePlayer from '@/index'

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
          <DotLottiePlayer controls subframe src="/am.lottie" />
        </div>

      </div>
    </>
  )
}

export default App
