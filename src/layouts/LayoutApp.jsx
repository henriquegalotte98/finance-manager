import Dashboard from "../pages/Dashboard"
import Excel from "../components/Excel"

export default function LayoutApp() {

  return (
    <div className='app_container'>

      <div className='side_menu_container'>
        MENU LATERAL AQUI
      </div>

      <div className='app'>
        <Dashboard />
      </div>

    </div>
  )
}