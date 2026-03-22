import React, { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import {
  ArrowRightLeft,
  Download,
  Edit2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react';

const GROUP_STYLES = {
  1: { seat: 'seat seat-pink', badge: 'badge badge-pink', panel: 'group-panel panel-pink' },
  2: { seat: 'seat seat-green', badge: 'badge badge-green', panel: 'group-panel panel-green' },
  3: { seat: 'seat seat-yellow', badge: 'badge badge-yellow', panel: 'group-panel panel-yellow' },
  4: { seat: 'seat seat-sky', badge: 'badge badge-sky', panel: 'group-panel panel-sky' },
};

const createInitialRules = () => ({
  title:
    'Đến giờ bạn nào chưa xuống thì đẩy lên ngồi cho kín hàng, và ghi vào những bạn xuống chào cờ muộn, vắng. Bạn nào xuống chậm, ngồi không đúng vị trí ghi lỗi.',
  notes: [
    'Nhóm 1: Đồng Linh phụ trách chịu trách nhiệm điểm danh các bạn.',
    'Nhóm 2: Xuân Huy phụ trách chịu trách nhiệm điểm danh các bạn.',
    'Nhóm 3: Ngọc Lan phụ trách chịu trách nhiệm điểm danh các bạn.',
    'Nhóm 4: Thảo phụ trách chịu trách nhiệm điểm danh các bạn.',
    'Lưu ý: bạn nào vắng thì đẩy dịch chỗ ngồi lên, nếu là không phép và muộn thì ghi lại tính lỗi.',
  ],
});

const createInitialGroups = () => [
  {
    id: 1,
    name: 'Nhóm 1',
    members: [
      'Chu Trần An', 'Lục Đại An', 'Mã Lâm Anh', 'Phan Tạ Hữu Bằng',
      'Nguyễn Đức Cường', 'Lâm Ngọc Huyền Diệu', 'Nguyễn Tiến Dũng',
      'Nông Trung Dũng', 'Lê Minh Đạo', 'Phạm Hải Đăng',
      'Nguyễn Ngọc Khánh Đoan', 'Đồng Thị Khánh Linh',
    ],
  },
  {
    id: 2,
    name: 'Nhóm 2',
    members: [
      'Nguyễn Mã Tú Giang', 'Phùng Thu Hà', 'Trần Hanh', 'Trương Thanh Hiếu',
      'Nguyễn Thị Hồng Huế', 'Hồ Tá Huy', 'Nguyễn Xuân Huy', 'Nông Gia Huy',
      'Nông Gia Huy', 'Trần Gia Huy', 'Nguyễn Kim Khánh',
    ],
  },
  {
    id: 3,
    name: 'Nhóm 3',
    members: [
      'Nông Nguyễn Tú Lan', 'Sầm Ngọc Lan', 'Dương Khánh Linh', 'Nguyễn Thị Ngọc Linh',
      'Nông Hoàng Linh', 'Bùi Gia Long', 'Hoàng Duy Lợi', 'Hoàng Sỹ Minh',
      'Lục Tuấn Minh', 'Nông Tuệ Minh', 'Hoàng Ngọc Bảo Nam',
    ],
  },
  {
    id: 4,
    name: 'Nhóm 4',
    members: [
      'Mã Linh Nga', 'Đinh Bích Ngọc', 'Lục Bảo Ngọc', 'Trần Hồng Ngọc',
      'Nông Yến Nhi', 'Nông Hoàng Phúc', 'Ngô Thu Thảo', 'Hoàng Thị Kim Thoa',
      'Lục Minh Thuận', 'Mông Thúy Trang', 'Hà Anh Tú',
    ],
  },
];

const generateInitialSeating = () => {
  const row1 = [];
  const row2 = [];

  for (let i = 1; i <= 23; i += 1) {
    const groupId = i <= 11 ? 3 : 1;
    row1.push({ id: `r1-${i}`, num: i, label: `Nhóm ${groupId}`, groupId });
  }

  for (let i = 1; i <= 22; i += 1) {
    const groupId = i <= 11 ? 4 : 2;
    row2.push({ id: `r2-${i}`, num: i, label: `Nhóm ${groupId}`, groupId });
  }

  return { row1, row2 };
};

const generateComplexID = (length) => {
  const pools = {
    latin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    eastArabic: '٠١٢٣٤٥٦٧٨٩',
    roman: 'ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫⅬⅭⅮⅯ',
    greekUpper: 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ',
    greekLower: 'αβγδεζηθικλμνξοπρστυφχψω',
    hebrew: 'אבגדהוזחטיכלמנסעפצקרשת',
    typographic: '§¶†‡@#%&?!©®™',
    kanji: '一二三四五六七八九十百千万',
    devanagari: '०१२३४५६७८९',
  };

  const keys = Object.keys(pools);
  return Array.from({ length }, () => {
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const pool = pools[randomKey];
    return pool.charAt(Math.floor(Math.random() * pool.length));
  }).join('');
};

function App() {
  const captureRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [rules, setRules] = useState(createInitialRules);
  const [groups, setGroups] = useState(createInitialGroups);
  const [seating, setSeating] = useState(generateInitialSeating);
  const [swapSource, setSwapSource] = useState(1);
  const [swapTarget, setSwapTarget] = useState(3);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    document.title = 'Sơ đồ lớp chào cờ';
  }, []);

  const groupOptions = useMemo(() => [1, 2, 3, 4], []);

  const handleMemberChange = (groupId, index, value) => {
    setGroups((current) => current.map((group) => (
      group.id === groupId
        ? { ...group, members: group.members.map((member, memberIndex) => (memberIndex === index ? value : member)) }
        : group
    )));
  };

  const addMember = (groupId) => {
    setGroups((current) => current.map((group) => (
      group.id === groupId ? { ...group, members: [...group.members, '...'] } : group
    )));
  };

  const removeMember = (groupId, index) => {
    setGroups((current) => current.map((group) => (
      group.id === groupId
        ? { ...group, members: group.members.filter((_, memberIndex) => memberIndex !== index) }
        : group
    )));
  };

  const handleSeatingChange = (rowKey, index, field, value) => {
    setSeating((current) => ({
      ...current,
      [rowKey]: current[rowKey].map((seat, seatIndex) => (seatIndex === index ? { ...seat, [field]: value } : seat)),
    }));
  };

  const cycleGroupForSeat = (rowKey, index) => {
    setSeating((current) => ({
      ...current,
      [rowKey]: current[rowKey].map((seat, seatIndex) => {
        if (seatIndex !== index) return seat;
        const nextGroup = seat.groupId === 4 ? 1 : seat.groupId + 1;
        return { ...seat, groupId: nextGroup, label: `Nhóm ${nextGroup}` };
      }),
    }));
  };

  const swapEntireGroups = () => {
    if (swapSource === swapTarget) return;

    const swapSeat = (seat) => {
      if (seat.groupId === swapSource) {
        return { ...seat, groupId: swapTarget, label: seat.label === `Nhóm ${swapSource}` ? `Nhóm ${swapTarget}` : seat.label };
      }
      if (seat.groupId === swapTarget) {
        return { ...seat, groupId: swapSource, label: seat.label === `Nhóm ${swapTarget}` ? `Nhóm ${swapSource}` : seat.label };
      }
      return seat;
    };

    setSeating((current) => ({
      row1: current.row1.map(swapSeat),
      row2: current.row2.map(swapSeat),
    }));
  };

  const handleDownload = async () => {
    if (!captureRef.current) return;

    setDownloading(true);
    const newId = generateComplexID(21);
    setGeneratedId(newId);
    const wasEditMode = isEditMode;
    setIsEditMode(false);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 300));

      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: 1800,
        height: captureRef.current.scrollHeight + 20,
      });

      const link = document.createElement('a');
      link.download = `so-do-lop-[${newId}].png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Không thể xuất ảnh sơ đồ lớp.', error);
      window.alert('Không thể xuất ảnh. Vui lòng thử lại.');
    } finally {
      setIsEditMode(wasEditMode);
      setDownloading(false);
    }
  };

  const SeatItem = ({ seat, idx, rowKey }) => {
    const seatClassName = GROUP_STYLES[seat.groupId]?.seat ?? 'seat';

    return (
      <div className={seatClassName}>
        <span className="seat-number">{seat.num}.</span>
        {isEditMode ? (
          <div className="seat-edit-wrap">
            <input
              type="text"
              value={seat.label}
              onChange={(event) => handleSeatingChange(rowKey, idx, 'label', event.target.value)}
              className="text-input"
            />
            <button type="button" onClick={() => cycleGroupForSeat(rowKey, idx)} className="icon-button">
              <RefreshCw size={16} />
            </button>
          </div>
        ) : (
          <span className="seat-label">{seat.label}</span>
        )}
      </div>
    );
  };

  return (
    <div className="page-shell">
      <div className="hero">
        <div>
          <p className="eyebrow">Static React app • pinned package versions • no floating CDN URL</p>
          <h1>Sơ đồ lớp chào cờ</h1>
          <p className="hero-copy">
            Trang web này chạy hoàn toàn bằng React + Vite, dùng dependency cài qua npm với phiên bản khóa cứng
            để tránh lỗi do URL CDN tự thay đổi theo thời gian.
          </p>
        </div>
        <div className="hero-card">
          <strong>Triển khai public</strong>
          <p>Build đầu ra nằm trong thư mục <code>dist/</code> nên có thể deploy lên Vercel, Netlify, Cloudflare Pages hoặc Surge.</p>
          <p className="generated-id">ID ảnh gần nhất: <span>{generatedId || 'Chưa tạo'}</span></p>
        </div>
      </div>

      <div className="floating-controls">
        {isEditMode && (
          <div className="swap-panel">
            <p className="swap-title">Đổi vị trí toàn nhóm</p>
            <div className="swap-controls">
              <select value={swapSource} onChange={(event) => setSwapSource(Number(event.target.value))}>
                {groupOptions.map((option) => <option key={`source-${option}`} value={option}>Nhóm {option}</option>)}
              </select>
              <ArrowRightLeft size={20} />
              <select value={swapTarget} onChange={(event) => setSwapTarget(Number(event.target.value))}>
                {groupOptions.map((option) => <option key={`target-${option}`} value={option}>Nhóm {option}</option>)}
              </select>
              <button type="button" className="primary-button compact" onClick={swapEntireGroups}>Đổi</button>
            </div>
          </div>
        )}

        <div className="control-row">
          <button type="button" onClick={handleDownload} className="primary-button">
            <Download size={22} /> {downloading ? 'Đang xuất...' : 'Tải ảnh'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditMode((current) => !current)}
            className={`primary-button ${isEditMode ? 'success' : 'secondary'}`}
          >
            {isEditMode ? <><Save size={22} /> Lưu lại</> : <><Edit2 size={22} /> Sửa đổi</>}
          </button>
        </div>
      </div>

      <div className="capture-area-wrapper">
        <div ref={captureRef} className="capture-area">
          <div className="layout-grid">
            <section className="left-column">
              <h2>Vị trí ngồi chào cờ</h2>
              <div className="seat-table">
                <div className="seat-table-header">
                  <div>
                    Hàng 1
                    <span>(sau biển lớp)</span>
                  </div>
                  <div>Hàng 2</div>
                </div>
                <div className="seat-columns">
                  <div className="seat-column bordered">
                    {seating.row1.map((seat, idx) => <SeatItem key={seat.id} seat={seat} idx={idx} rowKey="row1" />)}
                  </div>
                  <div className="seat-column">
                    {seating.row2.map((seat, idx) => <SeatItem key={seat.id} seat={seat} idx={idx} rowKey="row2" />)}
                    <div className="seat-filler" />
                  </div>
                </div>
              </div>
            </section>

            <section className="right-column">
              <div className="rules-panel">
                <div className="rules-header">
                  {isEditMode ? (
                    <textarea
                      className="textarea-input"
                      rows={3}
                      value={rules.title}
                      onChange={(event) => setRules((current) => ({ ...current, title: event.target.value }))}
                    />
                  ) : (
                    <h3>{rules.title}</h3>
                  )}
                </div>

                <div className="notes-list">
                  {rules.notes.map((note, idx) => (
                    <div key={`note-${idx}`} className="note-item">
                      {isEditMode ? (
                        <input
                          className="text-input"
                          value={note}
                          onChange={(event) => setRules((current) => ({
                            ...current,
                            notes: current.notes.map((currentNote, noteIndex) => (noteIndex === idx ? event.target.value : currentNote)),
                          }))}
                        />
                      ) : (
                        <p>{note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="groups-grid">
                {groups.map((group, groupIndex) => (
                  <div
                    key={group.id}
                    className={`group-card ${groupIndex % 2 === 0 ? 'border-right' : ''} ${groupIndex < 2 ? 'border-bottom' : ''}`}
                  >
                    <div className="group-card-header">
                      <span>{group.name}</span>
                      <span className={GROUP_STYLES[group.id].badge} />
                    </div>
                    <div className={GROUP_STYLES[group.id].panel}>
                      <div className="member-list">
                        {group.members.map((member, memberIndex) => (
                          <div key={`${group.id}-${memberIndex}`} className="member-row">
                            <span className="member-index">{memberIndex + 1}.</span>
                            {isEditMode ? (
                              <div className="member-edit-wrap">
                                <input
                                  type="text"
                                  value={member}
                                  onChange={(event) => handleMemberChange(group.id, memberIndex, event.target.value)}
                                  className="text-input"
                                />
                                <button type="button" className="danger-button" onClick={() => removeMember(group.id, memberIndex)}>
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            ) : (
                              <span className="member-name">{member}</span>
                            )}
                          </div>
                        ))}
                        {isEditMode && (
                          <div className="member-add-row">
                            <button type="button" className="ghost-button" onClick={() => addMember(group.id)}>
                              <Plus size={18} /> Thêm
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
