export function Settings({ settings, setSettings, currentPage, setCurrentPage }) {
       
    const formatString = (str) => {
        return str
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setSettings(prevSettings => 
            prevSettings.map(setting => 
            setting.name === name 
                ? { ...setting, state: checked }
                : setting
            )
  );
}
    return (
        <>
            <div className="ach-container" style={{
                display: `${currentPage !== "set" ? "none" : ""}`
            }}>
                <div className="ach-items-list">
                    <div className="ach-title">
                        <h2>Settings</h2>
                    </div>
                    <div className="items-scroll-container">
                        {settings.map((a) => {
                            const uniqueId = `setting-${a.id}`;
                            return (
                                <div className="ach-list-item" key={a.id}>
                                    <input 
                                        type="checkbox" 
                                        id={uniqueId}
                                        name={a.name}
                                        checked={settings.find(s => s.name === a.name).state}
                                        onChange={handleCheckboxChange}
                                    />
                                    <label htmlFor={uniqueId} className="ach-list-item-name">
                                        {formatString(a.name)}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                    <div className="item-buttons">
                        <button
                            className="back-button"
                            onClick={() => {setCurrentPage("game")}}
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
            </>
    );
}