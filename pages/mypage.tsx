export const Mypage = () => {
    return (
        <main class='container'>
            <section>
                <h2>즐겨찾는 지역 관리</h2>
                <div class='search-form'>
                    <div>
                        <div class='form-group'>
                            <label for='area1'>지역 (시/도)</label>
                            <select id='area1' name='area1'>
                                <option value=''>선택</option>
                            </select>
                        </div>
                        <div class='form-group'>
                            <label for='area2'>지역 (시/군/구)</label>
                            <select id='area2' name='area2' disabled>
                                <option value=''>선택</option>
                            </select>
                        </div>
                        <div class='form-group'>
                            <label for='area3'>지역 (읍/면/동)</label>
                            <select id='area3' name='area3' disabled>
                                <option value=''>선택</option>
                            </select>
                        </div>
                    </div>
                    <div class='form-controls'>
                        <button id='addFavoriteBtn' class='btn btn-primary'>
                            즐겨찾기 추가
                        </button>
                    </div>
                </div>
            </section>
            <section>
                <h3>즐겨찾기 목록</h3>
                <ul id='favoritesList' class='favorites-list'></ul>
            </section>
        </main>
    )
}
