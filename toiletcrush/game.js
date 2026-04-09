class ToiletGame {
    constructor() {
        this.coins = 100.0; // 金币数用float
        this.draws = 0;
        this.grid = Array(9).fill(null);
        this.wishColor = 'white'; // 默认许愿色
        this.isDrawing = false;
        this.superRareModalOpen = false; // 跟踪超稀有马桶弹窗是否打开
        this.audioContext = null; // 音频上下文
        this.colorCounts = {
            'N': {
                red: 0,
                yellow: 0,
                blue: 0,
                green: 0,
                orange: 0,
                purple: 0,
                black: 0,
                white: 0,
                gray: 0,
                gold: 0,
                rosegold: 0,
                blackgold: 0
            },
            'R': {
                red: 0,
                yellow: 0,
                blue: 0,
                green: 0,
                orange: 0,
                purple: 0,
                black: 0,
                white: 0,
                gray: 0,
                gold: 0,
                rosegold: 0,
                blackgold: 0
            },
            'UR': {
                red: 0,
                yellow: 0,
                blue: 0,
                green: 0,
                orange: 0,
                purple: 0,
                black: 0,
                white: 0,
                gray: 0,
                gold: 0,
                rosegold: 0,
                blackgold: 0
            }
        };
        // 时间变量
        this.basePlaceDelay = 500; // 放置马桶的基础时间
        this.baseSettleDelay = 500; // 结算的基础时间
        this.speedMultiplier = 1; // 倍速乘数
        
        // 奖池相关
        this.currentPool = 'N'; // 当前奖池
        this.poolSettings = {
            'N': { probability: 0.03, cost: 1, unlocked: true, unlockCost: 0 }, // N奖池：3%几率，1金币/抽
            'R': { probability: 0.02, cost: 2, unlocked: false, unlockCost: 100 }, // R奖池：2%几率，2金币/抽
            'UR': { probability: 0.01, cost: 5, unlocked: false, unlockCost: 500 } // UR奖池：1%几率，5金币/抽
        };
        
        // 市场相关
        this.marketPrices = {
            'N': {
                red: 0.5,
                yellow: 0.5,
                blue: 0.5,
                green: 0.5,
                orange: 0.5,
                purple: 0.5,
                black: 0.5,
                white: 0.5,
                gray: 0.5,
                gold: 20,
                rosegold: 25,
                blackgold: 30
            },
            'R': {
                red: 1.0,
                yellow: 1.0,
                blue: 1.0,
                green: 1.0,
                orange: 1.0,
                purple: 1.0,
                black: 1.0,
                white: 1.0,
                gray: 1.0,
                gold: 50,
                rosegold: 50,
                blackgold: 50
            },
            'UR': {
                red: 3.0,
                yellow: 3.0,
                blue: 3.0,
                green: 3.0,
                orange: 3.0,
                purple: 3.0,
                black: 3.0,
                white: 3.0,
                gray: 3.0,
                gold: 100,
                rosegold: 100,
                blackgold: 100
            }
        };
        
        // 存储上一次的价格，用于计算价格变化
        this.previousMarketPrices = JSON.parse(JSON.stringify(this.marketPrices));
        this.selectedToilets = new Set();
        
        // 价格变动倒计时
        this.priceCountdown = 60;
        this.countdownInterval = null;
        
        this.initElements();
        this.initEvents();
        this.updateLuckyToiletDisplay(); // 初始化时更新幸运色马桶显示
        this.updatePoolButtons(); // 初始化奖池按钮状态
        this.updateColorCountIcons(); // 初始化所有奖池的马桶图标
        this.updateUI();
        this.startMarketPriceUpdates(); // 开始市场价格更新
    }
    
    initElements() {
        this.coinsElement = document.getElementById('coins');
        // 移除已抽次数的显示，所以不再获取draws元素
        // this.drawsElement = document.getElementById('draws');
        this.gridElement = document.getElementById('grid');
        this.drawCountInput = document.getElementById('draw-count');
        this.drawButton = document.getElementById('draw-btn');
        this.resetButton = document.getElementById('reset-btn');
        this.colorOptions = document.querySelectorAll('.color-option');
        this.notification = document.getElementById('notification');
        this.placeSound = document.getElementById('place-sound');
        this.coinSound = document.getElementById('coin-sound');
        this.costDisplay = document.getElementById('cost-display');
        
        // 颜色计数元素
        this.colorCountElements = {
            red: document.getElementById('count-red'),
            yellow: document.getElementById('count-yellow'),
            blue: document.getElementById('count-blue'),
            green: document.getElementById('count-green'),
            orange: document.getElementById('count-orange'),
            purple: document.getElementById('count-purple'),
            black: document.getElementById('count-black'),
            white: document.getElementById('count-white'),
            gray: document.getElementById('count-gray'),
            gold: document.getElementById('count-gold'),
            rosegold: document.getElementById('count-rosegold'),
            blackgold: document.getElementById('count-blackgold')
        };
        
        // 移除框元素
        this.removeBox = document.getElementById('remove-box');
        this.drawCountInput = document.getElementById('draw-count');
        
        // 剩余抽数元素
        this.remainingDrawsElement = document.getElementById('remaining-draws');
        
        // 当前奖池元素
        this.currentPoolElement = document.getElementById('current-pool');
        
        // 幸运色马桶元素
        this.luckyToiletElement = document.getElementById('lucky-toilet');
        this.luckyColorDisplay = document.getElementById('lucky-color-display');
        
        // 超稀有马桶元素
        this.superRareToiletElement = document.getElementById('super-rare-toilet');
        
        // 市场相关元素
        this.toggleMarketButton = document.getElementById('toggle-market');
        this.marketContainer = document.getElementById('market-container');
        this.toiletList = document.getElementById('toilet-list');
        this.sellSelectedButton = document.getElementById('sell-selected');
        this.closeMarketButton = document.getElementById('close-market');
        
        // 价格元素
        this.priceElements = {
            red: document.getElementById('price-red'),
            yellow: document.getElementById('price-yellow'),
            blue: document.getElementById('price-blue'),
            green: document.getElementById('price-green'),
            orange: document.getElementById('price-orange'),
            purple: document.getElementById('price-purple'),
            black: document.getElementById('price-black'),
            white: document.getElementById('price-white'),
            gray: document.getElementById('price-gray'),
            gold: document.getElementById('price-gold'),
            rosegold: document.getElementById('price-rosegold'),
            blackgold: document.getElementById('price-blackgold')
        };
    }
    
    initEvents() {
        this.drawButton.addEventListener('click', () => this.startDrawing());
        this.resetButton.addEventListener('click', () => this.resetGame());
        
        this.colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                if (this.isDrawing) return; // 游戏进行时禁止改动
                
                this.colorOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.wishColor = option.dataset.color;
                // 更新幸运色马桶显示
                this.updateLuckyToiletDisplay();
            });
        });
        
        // 抽几发按钮事件
        const drawButtons = document.querySelectorAll('[data-draw-count]');
        drawButtons.forEach(button => {
            button.addEventListener('click', () => {
                const count = button.dataset.drawCount;
                document.getElementById('draw-count').value = count;
                
                // 更新按钮样式
                drawButtons.forEach(btn => btn.classList.remove('btn-primary'));
                drawButtons.forEach(btn => btn.classList.add('btn-secondary'));
                button.classList.remove('btn-secondary');
                button.classList.add('btn-primary');
                
                // 更新购买抽数需要的金币数
                this.updateCostDisplay();
            });
        });
        
        // 默认选中12发
        drawButtons[0].click();
        
        // 默认选中白色
        this.colorOptions[0].classList.add('selected');
        
        // 倍速控制按钮事件
        const speedButtons = document.querySelectorAll('[data-speed]');
        speedButtons.forEach(button => {
            button.addEventListener('click', () => {
                const speed = parseInt(button.dataset.speed);
                this.speedMultiplier = speed;
                
                // 更新按钮样式
                speedButtons.forEach(btn => btn.classList.remove('btn-primary'));
                speedButtons.forEach(btn => btn.classList.add('btn-secondary'));
                button.classList.remove('btn-secondary');
                button.classList.add('btn-primary');
            });
        });
        
        // 默认选中1倍速
        speedButtons[0].click();
        
        // 奖池切换按钮事件
        const poolButtons = document.querySelectorAll('[data-pool]');
        poolButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (this.isDrawing) return; // 游戏进行时禁止改动
                
                const pool = button.dataset.pool;
                const poolSetting = this.poolSettings[pool];
                
                // 检查是否已解锁
                if (!poolSetting.unlocked) {
                    // 显示解锁确认弹窗
                    if (confirm(`是否要花${poolSetting.unlockCost}金币解锁该奖池？`)) {
                        if (this.coins >= poolSetting.unlockCost) {
                            // 扣除金币并解锁
                            this.coins -= poolSetting.unlockCost;
                            poolSetting.unlocked = true;
                            this.updateUI();
                            this.updatePoolButtons();
                            
                            // 切换到该奖池
                            this.currentPool = pool;
                            
                            // 更新按钮样式
                            poolButtons.forEach(btn => btn.classList.remove('btn-primary'));
                            poolButtons.forEach(btn => btn.classList.add('btn-secondary'));
                            button.classList.remove('btn-secondary');
                            button.classList.add('btn-primary');
                            
                            // 更新背包中马桶的图标
                            this.updateColorCountIcons();
                            // 更新幸运色马桶图标
                            this.updateLuckyToiletDisplay();
                            // 更新购买抽数需要的金币数
                            this.updateCostDisplay();
                            // 更新奖池信息
                            this.updatePoolInfo();
                            // 更新物品栏显示
                            this.updateUI();
                        } else {
                            alert('金币不足！');
                        }
                    }
                } else {
                    // 已解锁，直接切换
                    this.currentPool = pool;
                    
                    // 更新按钮样式
                    poolButtons.forEach(btn => btn.classList.remove('btn-primary'));
                    poolButtons.forEach(btn => btn.classList.add('btn-secondary'));
                    button.classList.remove('btn-secondary');
                    button.classList.add('btn-primary');
                    
                    // 更新背包中马桶的图标
                    this.updateColorCountIcons();
                    // 更新幸运色马桶图标
                    this.updateLuckyToiletDisplay();
                    // 更新购买抽数需要的金币数
                    this.updateCostDisplay();
                    // 更新奖池信息
                    this.updatePoolInfo();
                    // 更新物品栏显示
                    this.updateUI();
                }
            });
        });
        
        // 默认选中N奖池
        poolButtons[0].click();
        
        // 游戏规则弹窗事件
        const rulesButton = document.getElementById('rules-btn');
        const rulesModal = document.getElementById('rules-modal');
        const rulesOverlay = document.getElementById('rules-overlay');
        const closeRulesButton = document.getElementById('close-rules');
        
        if (rulesButton) {
            rulesButton.addEventListener('click', () => {
                rulesModal.style.display = 'block';
                rulesOverlay.style.display = 'block';
            });
        }
        
        if (closeRulesButton) {
            closeRulesButton.addEventListener('click', () => {
                rulesModal.style.display = 'none';
                rulesOverlay.style.display = 'none';
            });
        }
        
        if (rulesOverlay) {
            rulesOverlay.addEventListener('click', () => {
                rulesModal.style.display = 'none';
                rulesOverlay.style.display = 'none';
            });
        }
        
        // 市场相关事件
        if (this.toggleMarketButton) {
            this.toggleMarketButton.addEventListener('click', () => this.toggleMarket());
        }
        if (this.sellSelectedButton) {
            this.sellSelectedButton.addEventListener('click', () => this.sellSelectedToilets());
        }
        if (this.closeMarketButton) {
            this.closeMarketButton.addEventListener('click', () => this.closeMarket());
        }
        // 卖出除超稀有外所有马桶按钮事件
        this.sellAllExceptSuperRareButton = document.getElementById('sell-all-except-super-rare');
        if (this.sellAllExceptSuperRareButton) {
            this.sellAllExceptSuperRareButton.addEventListener('click', () => this.sellAllExceptSuperRare());
        }
        
        // Debug tool: 输入"toiletlove"增加1000金币
        let debugInput = '';
        document.addEventListener('keydown', (e) => {
            debugInput += e.key.toLowerCase();
            // 只保留最后10个字符，防止内存占用
            if (debugInput.length > 10) {
                debugInput = debugInput.substring(debugInput.length - 10);
            }
            // 检查是否输入了"toiletlove"
            if (debugInput.includes('toiletlove')) {
                this.coins += 1000;
                this.updateUI();
                this.showNotification('获得1000金币！');
                // 重置输入
                debugInput = '';
            }
        });
        
        // 初始化市场马桶图标
        this.updateMarketToiletIcons();
    }
    
    updateUI(remainingDraws = 0) {
        this.coinsElement.textContent = this.coins.toFixed(1);
        // 移除已抽次数的显示，所以不再更新draws元素
        // this.drawsElement.textContent = this.draws;
        
        // 更新剩余抽数
        if (this.remainingDrawsElement) {
            // 如果remainingDraws为-1，保持当前值不变
            if (remainingDraws !== -1) {
                this.remainingDrawsElement.textContent = remainingDraws;
            }
        }
        
        // 更新九宫格
        for (let i = 0; i < 9; i++) {
            const cell = this.gridElement.querySelector(`[data-index="${i}"]`);
            if (this.grid[i]) {
                const color = this.grid[i];
                const iconPath = this.getToiletIconPath(color);
                cell.innerHTML = `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 40px; color: #999; font-weight: bold; z-index: 1;">${i + 1}</div><img src="${iconPath}" style="width: 80%; height: 80%; transition: transform 0.2s ease; z-index: 2;">`;
                
                // 添加鼠标碰撞效果
                cell.style.position = 'relative';
                const toiletImg = cell.querySelector('img');
                
                // 移除旧的事件监听器
                cell.removeEventListener('mousemove', cell._mouseMoveHandler);
                cell.removeEventListener('mouseleave', cell._mouseLeaveHandler);
                
                // 鼠标移动事件
                cell._mouseMoveHandler = (e) => {
                    if (this.isDrawing) return; // 结算时停用效果
                    
                    const rect = cell.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    // 计算鼠标与中心的距离和角度
                    const deltaX = e.clientX - centerX;
                    const deltaY = e.clientY - centerY;
                    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    
                    // 限制最大移动距离
                    const maxDistance = 10;
                    const moveDistance = Math.min(distance / 10, maxDistance);
                    
                    // 计算移动方向
                    const moveX = (deltaX / distance) * moveDistance * 0.5;
                    const moveY = (deltaY / distance) * moveDistance * 0.5;
                    
                    // 应用变换
                    toiletImg.style.transform = `translate(${moveX}px, ${moveY}px)`;
                };
                
                // 鼠标离开事件
                cell._mouseLeaveHandler = () => {
                    if (this.isDrawing) return; // 结算时停用效果
                    toiletImg.style.transform = 'translate(0, 0)';
                };
                
                // 添加新的事件监听器
                cell.addEventListener('mousemove', cell._mouseMoveHandler);
                cell.addEventListener('mouseleave', cell._mouseLeaveHandler);
            } else {
                cell.innerHTML = `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 40px; color: #999; font-weight: bold;">${i + 1}</div>`;
                // 移除事件监听器
                cell.removeEventListener('mousemove', cell._mouseMoveHandler);
                cell.removeEventListener('mouseleave', cell._mouseLeaveHandler);
            }
        }
        
        // 更新颜色计数
        for (const pool in this.colorCounts) {
            for (const color in this.colorCounts[pool]) {
                const countElement = document.getElementById(`count-${color}-${pool}`);
                if (countElement) {
                    // 用数字显示马桶数量
                    const count = this.colorCounts[pool][color];
                    countElement.textContent = count;
                    
                    // 显示或隐藏马桶项
                    const colorCountItem = countElement.closest('.color-count-item');
                    if (colorCountItem) {
                        if (count > 0) {
                            colorCountItem.style.display = 'flex';
                        } else {
                            colorCountItem.style.display = 'none';
                        }
                    }
                }
            }
        }
        

    }
    
    updateLuckyToiletDisplay() {
        // 获取幸运色马桶方框元素
        const luckyToiletBox = document.getElementById('lucky-toilet-box');
        if (luckyToiletBox) {
            // 固定方框的背景颜色，不再跟随幸运色变化
            luckyToiletBox.style.backgroundColor = '#f0f0f0';
            // 调整文字颜色以确保可读性
            const luckyToilet = document.getElementById('lucky-toilet');
            if (luckyToilet) {
                // 固定文字颜色
                luckyToilet.style.color = '#000000';
                
                // 使用马桶图标代替emoji
                const iconPath = this.getToiletIconPath(this.wishColor);
                luckyToilet.innerHTML = `<img src="${iconPath}" style="width: 60px; height: 60px;">`;
            }
        }
        
        // 更新幸运色显示
        if (this.luckyColorDisplay) {
            const colorNames = {
                red: '红色',
                yellow: '黄色',
                blue: '蓝色',
                green: '绿色',
                orange: '橙色',
                purple: '紫色',
                black: '黑色',
                white: '白色',
                gray: '灰色'
            };
            this.luckyColorDisplay.textContent = colorNames[this.wishColor] || this.wishColor;
        }
    }
    
    // 辅助方法：判断颜色是否为浅色
    isLightColor(color) {
        // 简单的颜色亮度判断
        const colorMap = {
            'red': false,
            'yellow': true,
            'blue': false,
            'green': false,
            'orange': false,
            'purple': false,
            'black': false,
            'white': true,
            'gray': false
        };
        return colorMap[color] || false;
    }
    
    // 获取当前奖池对应的素材文件夹
    getPoolFolder() {
        switch (this.currentPool) {
            case 'N':
                return 'toilet_squat';
            case 'R':
                return 'toilet_tall';
            case 'UR':
                return 'toilet_norm';
            default:
                return 'toilet_norm';
        }
    }
    
    // 获取马桶图标路径
    getToiletIconPath(color) {
        const poolFolder = this.getPoolFolder();
        let spriteName = color;
        
        // 处理特殊颜色的文件名
        if (spriteName === 'gray') spriteName = 'grey';
        if (spriteName === 'rosegold') {
            // 根据不同文件夹使用不同的玫瑰金文件名
            if (poolFolder === 'toilet_squat') {
                spriteName = 'rosegold';
            } else {
                spriteName = 'pinkgold';
            }
        }
        
        // 构建正确的文件路径
        return `sprites/${poolFolder}/toile_${poolFolder.replace('toilet_', '')}_${spriteName}.png`;
    }
    
    // 切换市场显示
    toggleMarket() {
        if (this.marketContainer) {
            // 检查市场是否可见
            const isVisible = window.getComputedStyle(this.marketContainer).display !== 'none';
            if (!isVisible) {
                // 打开市场
                this.marketContainer.style.display = 'block';
                // 隐藏奖池选择按钮
                const poolButtons = document.querySelector('.pool-buttons');
                if (poolButtons) {
                    poolButtons.style.display = 'none';
                }
                // 隐藏幸运色马桶显示
                const luckyToiletBox = document.getElementById('lucky-toilet-box');
                if (luckyToiletBox) {
                    luckyToiletBox.style.display = 'none';
                }
                const luckyToiletLabel = document.querySelector('.lucky-toilet-label');
                if (luckyToiletLabel) {
                    luckyToiletLabel.style.display = 'none';
                }
                // 隐藏打开市场按钮
                if (this.toggleMarketButton) {
                    this.toggleMarketButton.style.display = 'none';
                }
                // 更新马桶卖出选项
                this.updateToiletList();
                // 更新价格显示
                this.updatePriceDisplay();
            } else {
                // 关闭市场
                this.closeMarket();
            }
        }
    }
    
    // 关闭市场
    closeMarket() {
        if (this.marketContainer) {
            this.marketContainer.style.display = 'none';
            // 显示奖池选择按钮
            const poolButtons = document.querySelector('.pool-buttons');
            if (poolButtons) {
                poolButtons.style.display = 'flex';
            }
            // 显示幸运色马桶显示
            const luckyToiletBox = document.getElementById('lucky-toilet-box');
            if (luckyToiletBox) {
                luckyToiletBox.style.display = 'flex';
            }
            const luckyToiletLabel = document.querySelector('.lucky-toilet-label');
            if (luckyToiletLabel) {
                luckyToiletLabel.style.display = 'block';
            }
            // 显示打开市场按钮
            if (this.toggleMarketButton) {
                this.toggleMarketButton.style.display = 'block';
            }
            // 清空选中的马桶
            this.selectedToilets.clear();
        }
    }
    
    // 更新马桶列表
    updateToiletList() {
        console.log('updateToiletList called');
        if (this.toiletList) {
            console.log('toiletList found:', this.toiletList);
            // 清空列表
            this.toiletList.innerHTML = '';
            
            console.log('colorCounts:', this.colorCounts);
            
            // 遍历每个奖池
            for (const pool in this.colorCounts) {
                console.log('Processing pool:', pool);
                // 添加奖池标题
                const poolTitle = document.createElement('h5');
                poolTitle.textContent = `${pool}奖池`;
                poolTitle.style.marginTop = '15px';
                poolTitle.style.marginBottom = '10px';
                poolTitle.style.fontSize = '14px';
                poolTitle.style.fontWeight = 'bold';
                poolTitle.style.color = '#666';
                this.toiletList.appendChild(poolTitle);
                
                // 添加每种颜色的马桶
                for (const color in this.colorCounts[pool]) {
                    const count = this.colorCounts[pool][color];
                    console.log(`Processing color ${color} in pool ${pool}: ${count}`);
                    if (count > 0) {
                        console.log(`Adding toilet item for ${color} in pool ${pool}: ${count}`);
                        const toiletItem = document.createElement('div');
                        toiletItem.style.display = 'flex';
                        toiletItem.style.alignItems = 'center';
                        toiletItem.style.justifyContent = 'space-between';
                        toiletItem.style.padding = '10px';
                        toiletItem.style.border = '2px solid #ddd';
                        toiletItem.style.borderRadius = '8px';
                        toiletItem.style.marginBottom = '10px';
                        toiletItem.style.transition = 'all 0.2s ease';
                        toiletItem.dataset.color = color;
                        toiletItem.dataset.pool = pool;
                        
                        // 左侧：马桶图标和名称
                        const leftSection = document.createElement('div');
                        leftSection.style.display = 'flex';
                        leftSection.style.alignItems = 'center';
                        leftSection.style.gap = '10px';
                        
                        // 临时保存当前奖池，以便使用正确的图标路径
                        const originalPool = this.currentPool;
                        this.currentPool = pool;
                        
                        // 添加马桶图标
                        const toiletIcon = document.createElement('img');
                        const iconPath = this.getToiletIconPath(color);
                        toiletIcon.src = iconPath;
                        toiletIcon.style.width = '40px';
                        toiletIcon.style.height = '40px';
                        leftSection.appendChild(toiletIcon);
                        
                        // 恢复原始奖池
                        this.currentPool = originalPool;
                        
                        // 添加颜色名称和数量
                        const colorInfo = document.createElement('div');
                        const colorNames = {
                            red: '红色',
                            yellow: '黄色',
                            blue: '蓝色',
                            green: '绿色',
                            orange: '橙色',
                            purple: '紫色',
                            black: '黑色',
                            white: '白色',
                            gray: '灰色',
                            gold: '金色',
                            rosegold: '玫瑰金',
                            blackgold: '黑金'
                        };
                        colorInfo.innerHTML = `<div style="font-weight: bold;">${colorNames[color]}</div><div style="font-size: 12px; color: #666;">数量: ${count}</div>`;
                        leftSection.appendChild(colorInfo);
                        
                        // 右侧：选中按钮
                        const rightSection = document.createElement('div');
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.style.width = '20px';
                        checkbox.style.height = '20px';
                        checkbox.dataset.color = color;
                        checkbox.dataset.pool = pool;
                        
                        // 添加点击事件
                        checkbox.addEventListener('change', () => {
                            const pool = checkbox.dataset.pool;
                            const color = checkbox.dataset.color;
                            if (checkbox.checked) {
                                this.selectedToilets.add(`${pool}-${color}`);
                                toiletItem.style.borderColor = '#4CAF50';
                                toiletItem.style.borderWidth = '3px';
                            } else {
                                this.selectedToilets.delete(`${pool}-${color}`);
                                toiletItem.style.borderColor = '#ddd';
                                toiletItem.style.borderWidth = '2px';
                            }
                        });
                        
                        rightSection.appendChild(checkbox);
                        
                        toiletItem.appendChild(leftSection);
                        toiletItem.appendChild(rightSection);
                        
                        this.toiletList.appendChild(toiletItem);
                    }
                }
            }
        } else {
            console.log('toiletList not found');
        }
    }
    
    // 卖出选中的马桶
    sellSelectedToilets() {
        if (this.selectedToilets.size === 0) {
            this.showNotification('请先选择要卖出的马桶');
            return;
        }
        
        let totalCoins = 0;
        const toiletCounts = {};
        
        // 计算卖出的马桶数量和获得的金币
        this.selectedToilets.forEach(item => {
            const [pool, color] = item.split('-');
            if (!toiletCounts[pool]) {
                toiletCounts[pool] = {};
            }
            const count = this.colorCounts[pool][color];
            toiletCounts[pool][color] = count;
            totalCoins += count * this.marketPrices[pool][color];
        });
        
        // 更新颜色计数
        for (const pool in toiletCounts) {
            for (const color in toiletCounts[pool]) {
                this.colorCounts[pool][color] = 0;
            }
        }
        
        // 更新金币
        this.coins += totalCoins;
        
        // 显示通知
        this.showNotification(`卖出成功！获得 ${totalCoins} 金币`);
        
        // 更新UI
        this.updateUI();
        this.updateToiletList();
        
        // 清空选中的马桶
        this.selectedToilets.clear();
    }
    
    // 卖出除超稀有外所有马桶
    sellAllExceptSuperRare() {
        // 显示确认弹窗
        if (confirm('确定要卖出超稀有之外的所有马桶吗？')) {
            let totalCoins = 0;
            const colorCounts = {};
            
            // 超稀有马桶类型
            const superRareTypes = ['gold', 'rosegold', 'blackgold'];
            
            // 计算卖出的马桶数量和获得的金币
            for (const color in this.colorCounts[this.currentPool]) {
                if (!superRareTypes.includes(color)) {
                    const count = this.colorCounts[this.currentPool][color];
                    if (count > 0) {
                        colorCounts[color] = count;
                        totalCoins += count * this.marketPrices[this.currentPool][color];
                    }
                }
            }
            
            // 更新颜色计数
            for (const color in colorCounts) {
                this.colorCounts[this.currentPool][color] = 0;
            }
            
            // 更新金币
            this.coins += totalCoins;
            
            // 显示通知
            this.showNotification(`卖出成功！获得 ${totalCoins} 金币`);
            
            // 更新UI
            this.updateUI();
            this.updateToiletList();
            
            // 清空选中的马桶
            this.selectedToilets.clear();
        }
    }
    
    // 开始市场价格更新
    startMarketPriceUpdates() {
        // 启动倒计时
        this.startCountdown();
        
        // 每分钟更新一次价格
        setInterval(() => {
            this.updateMarketPrices();
            // 重置倒计时
            this.priceCountdown = 60;
        }, 60000);
    }
    
    // 启动价格变动倒计时
    startCountdown() {
        this.countdownInterval = setInterval(() => {
            this.priceCountdown--;
            if (this.priceCountdown < 0) {
                this.priceCountdown = 60;
            }
            
            // 更新倒计时显示
            const countdownElement = document.getElementById('price-countdown');
            if (countdownElement) {
                countdownElement.textContent = this.priceCountdown;
            }
        }, 1000);
    }
    
    // 更新市场价格
    updateMarketPrices() {
        // 超稀有马桶类型
        const superRareTypes = ['gold', 'rosegold', 'blackgold'];
        
        // 保存当前价格作为旧价格
        const oldPrices = JSON.parse(JSON.stringify(this.marketPrices));
        
        // 遍历每个奖池
        for (const pool in this.marketPrices) {
            for (const color in this.marketPrices[pool]) {
                if (superRareTypes.includes(color)) {
                    // 超稀有马桶价格固定
                    continue;
                }
                
                let change;
                // 根据奖池设置不同的浮动范围
                switch (pool) {
                    case 'N':
                        // N奖池：-0.5 到 +0.5
                        change = (Math.random() * 1 - 0.5).toFixed(1);
                        break;
                    case 'R':
                        // R奖池：0 到 +1
                        change = (Math.random() * 1).toFixed(1);
                        break;
                    case 'UR':
                        // UR奖池：0 到 +2
                        change = (Math.random() * 2).toFixed(1);
                        break;
                    default:
                        change = (Math.random() * 1 - 0.5).toFixed(1);
                }
                
                const oldPrice = this.marketPrices[pool][color];
                const newPrice = parseFloat((parseFloat(oldPrice) + parseFloat(change)).toFixed(1));
                // 设置最低价格为0.1
                this.marketPrices[pool][color] = Math.max(0.1, newPrice);
            }
        }
        
        // 更新价格显示
        this.updatePriceDisplay(oldPrices);
        
        // 更新马桶图标
        this.updateMarketToiletIcons();
        
        // 保存当前价格作为下一次的历史价格
        this.previousMarketPrices = JSON.parse(JSON.stringify(this.marketPrices));
    }
    
    // 更新市场马桶图标
    updateMarketToiletIcons() {
        const toiletIcons = document.querySelectorAll('.toilet-icon');
        
        toiletIcons.forEach(icon => {
            const color = icon.dataset.color;
            const pool = icon.dataset.pool;
            // 临时保存当前奖池，以便使用正确的图标路径
            const originalPool = this.currentPool;
            this.currentPool = pool;
            const iconPath = this.getToiletIconPath(color);
            icon.style.backgroundImage = `url('${iconPath}')`;
            // 恢复原始奖池
            this.currentPool = originalPool;
        });
    }
    
    // 更新价格显示
    updatePriceDisplay(oldPrices = null) {
        // 遍历每个奖池
        for (const pool in this.marketPrices) {
            for (const color in this.marketPrices[pool]) {
                const priceElement = document.getElementById(`price-${color}-${pool}`);
                if (priceElement) {
                    priceElement.textContent = `${this.marketPrices[pool][color]} 金币`;
                }
                
                // 显示价格变化
                const changeElement = document.getElementById(`price-change-${color}-${pool}`);
                if (changeElement) {
                    let oldPrice;
                    if (oldPrices && oldPrices[pool] && oldPrices[pool][color]) {
                        oldPrice = oldPrices[pool][color];
                    } else if (this.previousMarketPrices[pool] && this.previousMarketPrices[pool][color]) {
                        oldPrice = this.previousMarketPrices[pool][color];
                    } else {
                        oldPrice = this.marketPrices[pool][color];
                    }
                    
                    const newPrice = this.marketPrices[pool][color];
                    const change = newPrice - oldPrice;
                    
                    if (change > 0) {
                        // 价格上涨，显示红色
                        changeElement.textContent = `+${change.toFixed(1)}`;
                        changeElement.className = 'price-change positive';
                    } else if (change < 0) {
                        // 价格下降，显示绿色
                        changeElement.textContent = `${change.toFixed(1)}`;
                        changeElement.className = 'price-change negative';
                    } else {
                        // 价格不变
                        changeElement.textContent = '';
                        changeElement.className = 'price-change';
                    }
                }
            }
        }
    }
    
    // 更新购买抽数需要的金币数
    updateCostDisplay() {
        if (this.costDisplay) {
            const drawCount = parseInt(this.drawCountInput.value) || 1;
            const poolCost = this.poolSettings[this.currentPool].cost;
            const totalCost = drawCount * poolCost;
            this.costDisplay.textContent = `需要金币: ${totalCost}`;
        }
    }
    
    // 更新奖池信息
    updatePoolInfo() {
        if (this.currentPoolElement) {
            const poolCost = this.poolSettings[this.currentPool].cost;
            this.currentPoolElement.textContent = `${this.currentPool}奖池 (${poolCost}金币/抽)`;
        }
    }
    
    // 更新奖池按钮状态
    updatePoolButtons() {
        const poolButtons = document.querySelectorAll('[data-pool]');
        poolButtons.forEach(button => {
            const pool = button.dataset.pool;
            const poolSetting = this.poolSettings[pool];
            
            // 清除按钮内容
            button.innerHTML = '';
            
            // 添加对应的白色马桶图标
            const iconPath = this.getPoolWhiteIconPath(pool);
            const iconImg = document.createElement('img');
            iconImg.src = iconPath;
            iconImg.style.width = '20px';
            iconImg.style.height = '20px';
            iconImg.style.marginRight = '8px';
            button.appendChild(iconImg);
            
            // 添加文字
            const textNode = document.createTextNode('');
            if (poolSetting.unlocked) {
                textNode.textContent = `${pool}奖池`;
            } else {
                textNode.textContent = `需要${poolSetting.unlockCost}金币解锁`;
            }
            button.appendChild(textNode);
        });
    }
    
    // 获取奖池对应的白色马桶图标路径
    getPoolWhiteIconPath(pool) {
        switch (pool) {
            case 'N':
                return 'sprites/toilet_squat/toile_squat_white.png';
            case 'R':
                return 'sprites/toilet_tall/toile_tall_white.png';
            case 'UR':
                return 'sprites/toilet_norm/toile_norm_white.png';
            default:
                return 'sprites/toilet_norm/toile_norm_white.png';
        }
    }
    
    // 更新背包中马桶的图标
    updateColorCountIcons() {
        const colorCountElements = document.querySelectorAll('.color-count-color');
        
        colorCountElements.forEach(element => {
            const color = element.dataset.color;
            const pool = element.dataset.pool;
            // 临时保存当前奖池，以便使用正确的图标路径
            const originalPool = this.currentPool;
            this.currentPool = pool;
            const iconPath = this.getToiletIconPath(color);
            element.style.backgroundImage = `url('${iconPath}')`;
            // 恢复原始奖池
            this.currentPool = originalPool;
        });
    }
    
    async startDrawing() {
        if (this.isDrawing || this.coins <= 0) return;
        
        const drawCount = parseInt(this.drawCountInput.value) || 1;
        const purchasedDraws = drawCount; // 记录购买的抽数
        
        // 检查金币是否足够
        const poolCost = this.poolSettings[this.currentPool].cost;
        const totalCost = drawCount * poolCost;
        if (this.coins < totalCost) {
            alert('金币不足！');
            return;
        }
        
        // 一次性扣除所需的金币
        this.coins -= totalCost;
        
        const initialCoins = this.coins;
        let targetDraws = drawCount;
        let completedDraws = 0;
        let extraDraws = 0;
        
        // 记录初始颜色计数
        const initialColorCounts = { ...this.colorCounts[this.currentPool] };
        
        this.isDrawing = true;
        this.drawButton.disabled = true;
        
        // 禁用其他按钮
        this.disableGameControls();
        
        // 更新UI，显示剩余抽数为购入的抽数
        this.updateUI(targetDraws);
        
        // 继续抽奖直到完成目标抽数（包括额外加抽）
        while (completedDraws < targetDraws && this.coins >= 0) {
            // 计算剩余抽数
            const remaining = targetDraws - completedDraws;
            // 更新UI显示剩余抽数
            this.updateUI(remaining);
            
            // 创建一个对象来传递和接收变量
            const variables = { targetDraws, extraDraws };
            await this.drawToilet(true, variables, completedDraws); // 传入true表示显示加抽弹窗，并传递变量和已完成抽数
            // 更新变量
            targetDraws = variables.targetDraws;
            extraDraws = variables.extraDraws;
            
            // 放置马桶后0.1s再扣除抽数
        await this.delay(100);
        completedDraws++;
        
        // 再次更新UI显示剩余抽数，确保加抽后剩余抽数正确显示
        const newRemaining = targetDraws - completedDraws;
        this.updateUI(newRemaining);
        
        await this.delay(this.basePlaceDelay / this.speedMultiplier); // 0.5秒停顿
        }
        
        // 当没有抽数时，结算九宫格里剩余的马桶
        // 记录结算前的剩余抽数
        let settlementExtraDraws = 0;
        let hasSettlementExtraDraws = true;
        
        // 循环结算，直到没有额外抽数
        while (hasSettlementExtraDraws) {
            hasSettlementExtraDraws = false;
            
            // 结算剩余的马桶
            const settlementResult = await this.settleRemainingToiletsWithExtraDraws(targetDraws, extraDraws, completedDraws);
            
            // 如果结算增加了抽数
            if (settlementResult.totalExtraDraws > 0) {
                hasSettlementExtraDraws = true;
                settlementExtraDraws += settlementResult.totalExtraDraws;
                extraDraws = settlementResult.extraDraws;
                targetDraws = settlementResult.targetDraws;
                
                // 继续抽取额外获得的抽数
                while (completedDraws < targetDraws && this.coins >= 0) {
                    // 计算剩余抽数
                    const remaining = targetDraws - completedDraws;
                    // 更新UI显示剩余抽数
                    this.updateUI(remaining);
                    
                    // 创建一个对象来传递和接收变量
                    const variables = { targetDraws, extraDraws };
                    await this.drawToilet(true, variables, completedDraws); // 传入true表示显示加抽弹窗，并传递变量和已完成抽数
                    // 更新变量
                    targetDraws = variables.targetDraws;
                    extraDraws = variables.extraDraws;
                    
                    // 放置马桶后0.1s再扣除抽数
                    await this.delay(100);
                    completedDraws++;
                    
                    // 再次更新UI显示剩余抽数，确保加抽后剩余抽数正确显示
                    const newRemaining = targetDraws - completedDraws;
                    this.updateUI(newRemaining);
                    
                    await this.delay(500); // 0.5秒停顿
                }
            }
        }
        
        // 撤掉所有马桶
        this.grid = Array(9).fill(null);
        // 抽奖结束后更新剩余抽数为0
        this.updateUI(0);
        
        // 计算此次抽奖的统计
        const totalDraws = completedDraws;
        const colorStats = {};
        
        for (const color in this.colorCounts[this.currentPool]) {
            colorStats[color] = this.colorCounts[this.currentPool][color] - initialColorCounts[color];
        }
        
        // 显示统计弹窗，传入购买的抽数
        this.showDrawStats(purchasedDraws, extraDraws, colorStats);
        
        this.isDrawing = false;
        this.drawButton.disabled = false;
        
        // 重新启用其他按钮
        this.enableGameControls();
    }
    
    // 禁用游戏控制按钮
    disableGameControls() {
        // 禁用奖池选择按钮
        const poolButtons = document.querySelectorAll('[data-pool]');
        poolButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
        });
        
        // 禁用幸运色选择按钮
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.style.pointerEvents = 'none';
            option.style.opacity = '0.5';
        });
        
        // 禁用购买抽数按钮
        const drawButtons = document.querySelectorAll('[data-draw-count]');
        drawButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
        });
    }
    
    // 启用游戏控制按钮
    enableGameControls() {
        // 启用奖池选择按钮
        const poolButtons = document.querySelectorAll('[data-pool]');
        poolButtons.forEach(button => {
            button.disabled = false;
            button.style.opacity = '1';
        });
        
        // 启用幸运色选择按钮
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.style.pointerEvents = 'auto';
            option.style.opacity = '1';
        });
        
        // 启用购买抽数按钮
        const drawButtons = document.querySelectorAll('[data-draw-count]');
        drawButtons.forEach(button => {
            button.disabled = false;
            button.style.opacity = '1';
        });
    }
    
    async drawToilet(showNotifications = true, variables = {}, completedDraws = 0) {
        this.draws++;
        
        // 检查是否抽到超稀有马桶（根据当前奖池的概率）
        const superRareProbability = this.poolSettings[this.currentPool].probability;
        const isSuperRare = Math.random() < superRareProbability;
        
        if (isSuperRare) {
            // 随机选择超稀有马桶类别
            const superRareTypes = ['gold', 'rosegold', 'blackgold'];
            const superRareType = superRareTypes[Math.floor(Math.random() * superRareTypes.length)];
            
            // 显示超稀有马桶弹窗
            this.showSuperRareNotification(superRareType);
            
            // 增加颜色计数（使用特殊颜色标记）
            this.colorCounts[this.currentPool][superRareType] = (this.colorCounts[this.currentPool][superRareType] || 0) + 1;
            
            // 立即更新UI，显示超稀有马桶
            this.updateUI(-1);
            
            // 增加额外抽数
            if (variables.targetDraws !== undefined) {
                variables.targetDraws += 3; // 超稀有马桶奖励3抽
                // 计算剩余抽数并更新UI
                const remaining = variables.targetDraws - completedDraws;
                this.updateUI(remaining);
            }
            if (variables.extraDraws !== undefined) {
                variables.extraDraws += 3;
            }
            
            // 播放金币获得音效
            this.playCoinSound();
            if (showNotifications) {
                // 找到最后一个非空格子（当前放置的超稀有马桶）
                let placedIndex = -1;
                for (let i = 8; i >= 0; i--) {
                    if (this.grid[i] !== null) {
                        placedIndex = i;
                        break;
                    }
                }
                if (placedIndex !== -1) {
                    const placedCell = this.gridElement.querySelector(`[data-index="${placedIndex}"]`);
                    this.showNotification('+5抽', placedCell);
                } else {
                    this.showNotification('+5抽');
                }
            }
        } else {
            // 随机颜色
            const colors = ['red', 'yellow', 'blue', 'green', 'orange', 'purple', 'black', 'white', 'gray'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // 增加颜色计数
            this.colorCounts[this.currentPool][color]++;
            
            // 放置马桶
            await this.placeToilet(color);
            
            // 立即更新UI，解决最后一个格子显示滞后的问题
            // 这里不更新剩余抽数，因为会在startDrawing方法中更新
            // 所以传递一个负数，让updateUI方法保持当前剩余抽数不变
            this.updateUI(-1);
            
            // 检查许愿色
            if (color === this.wishColor) {
                // 幸运数抽数增加在马桶放置后0.2s，受倍速控制
                await this.delay(200 / this.speedMultiplier);
                
                // 直接增加剩余抽数
                if (variables.targetDraws !== undefined) {
                    variables.targetDraws++;
                    // 计算剩余抽数并更新UI
                    const remaining = variables.targetDraws - completedDraws;
                    this.updateUI(remaining);
                }
                if (variables.extraDraws !== undefined) {
                    variables.extraDraws++;
                }
                // 播放金币获得音效
                this.playCoinSound();
                if (showNotifications) {
                    // 找到最后一个非空格子（当前放置的马桶）
                    let placedIndex = -1;
                    for (let i = 8; i >= 0; i--) {
                        if (this.grid[i] !== null) {
                            placedIndex = i;
                            break;
                        }
                    }
                    if (placedIndex !== -1) {
                        const placedCell = this.gridElement.querySelector(`[data-index="${placedIndex}"]`);
                        this.showNotification('+1抽', placedCell);
                    } else {
                        this.showNotification('+1抽');
                    }
                }
            }
        }
        
        // 检查匹配规则
        // 注意：这里不再立即增加抽数和显示通知，因为剩余抽数的增加和加抽的弹窗应当在依次结算配对马桶时才运行
        // const matchFound = this.checkMatches();
        // if (matchFound) {
        //     // 直接增加剩余抽数
        //     if (variables.targetDraws !== undefined) {
        //         variables.targetDraws += 2;
        //     }
        //     if (variables.extraDraws !== undefined) {
        //         variables.extraDraws += 2;
        //     }
        //     if (showNotifications) {
        //         this.showNotification('+2抽');
        //         this.playCoinSound();
        //     }
        // }
        
        // 检查九宫格是否摆满
        if (this.grid.every(cell => cell !== null)) {
            // 停顿0.5秒，受倍速控制
            await this.delay(500 / this.speedMultiplier);
            
            // 检查是否所有颜色都不同
            // 注意：这里不再立即增加抽数和显示通知，因为剩余抽数的增加和加抽的弹窗应当在依次结算配对马桶时才运行
            // const uniqueColors = new Set(this.grid);
            // if (uniqueColors.size === 9) {
            //     // 直接增加剩余抽数
            //     if (variables.targetDraws !== undefined) {
            //         variables.targetDraws += 3;
            //     }
            //     if (variables.extraDraws !== undefined) {
            //         variables.extraDraws += 3;
            //     }
            //     if (showNotifications) {
            //         this.showNotification('+3抽');
            //         this.playCoinSound();
            //     }
            // }
            
            // 撤掉符合规则的同色马桶并增加抽数
            // 等待0.5秒，确保最后一个马桶的放置动画完成，受倍速控制
            await this.delay(500 / this.speedMultiplier);
            const settlementResult = await this.settleRemainingToiletsWithExtraDraws(variables.targetDraws, variables.extraDraws, completedDraws);
            
            // 更新抽数，无论是否增加了抽数
            variables.targetDraws = settlementResult.targetDraws;
            variables.extraDraws = settlementResult.extraDraws;
            
            // 如果没有撤掉任何马桶，清空整个九宫格
            if (this.grid.every(cell => cell !== null)) {
                this.grid = Array(9).fill(null);
            }
        }
    }
    
    placeToilet(color) {
        // 找到第一个空位置
        let placedIndex = -1;
        for (let i = 0; i < 9; i++) {
            if (this.grid[i] === null) {
                this.grid[i] = color;
                placedIndex = i;
                break;
            }
        }
        
        // 播放放置声音
        this.playPlaceSound();
        
        // 如果是第九个格子，添加特殊停顿
        if (placedIndex === 8) {
            return this.delay(this.basePlaceDelay / this.speedMultiplier);
        }
        
        return Promise.resolve();
    }
    
    // 初始化音频上下文
    initAudioContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.log('Audio context creation failed:', e);
                this.audioContext = null;
            }
        }
    }
    
    playPlaceSound() {
        // 使用Web Audio API创建简单的音效
        try {
            this.initAudioContext();
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio play failed:', e);
        }
    }
    
    playCoinSound() {
        // 使用Web Audio API创建简单的音效
        try {
            this.initAudioContext();
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.15);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.15);
        } catch (e) {
            console.log('Audio play failed:', e);
        }
    }
    
    async removeMatchedToilets() {
        const lines = [
            // 横向
            { indices: [0, 1, 2], type: '横向三连' },
            { indices: [3, 4, 5], type: '横向三连' },
            { indices: [6, 7, 8], type: '横向三连' },
            // 纵向
            { indices: [0, 3, 6], type: '纵向三连' },
            { indices: [1, 4, 7], type: '纵向三连' },
            { indices: [2, 5, 8], type: '纵向三连' },
            // 斜向
            { indices: [0, 4, 8], type: '斜向三连' },
            { indices: [2, 4, 6], type: '斜向三连' },
            // 连号
            { indices: [1, 2, 3], type: '连号三连' },
            { indices: [2, 3, 4], type: '连号三连' },
            { indices: [3, 4, 5], type: '连号三连' },
            { indices: [4, 5, 6], type: '连号三连' },
            { indices: [5, 6, 7], type: '连号三连' }
        ];
        
        const matchedLines = [];
        
        // 检查所有可能的匹配
        for (const line of lines) {
            const [a, b, c] = line.indices;
            if (this.grid[a] && this.grid[a] === this.grid[b] && this.grid[b] === this.grid[c]) {
                matchedLines.push(line);
            }
        }
        
        // 移除匹配的马桶并显示UI
        for (const line of matchedLines) {
            // 同一配对中的马桶动画同时播放
            const animations = [];
            for (const index of line.indices) {
                const color = this.grid[index];
                animations.push(this.showMatchUIWithDelay(index, line.type, color));
            }
            
            // 等待所有动画完成
            await Promise.all(animations);
            
            // 移除所有马桶
            for (const index of line.indices) {
                this.grid[index] = null;
            }
            
            await this.delay(500 / this.speedMultiplier); // 增加延迟，确保动画完全播放，受倍速控制
        }
    }
    
    async removePairsAndAddDraws() {
        // 统计每种颜色的数量
        const colorCount = {};
        for (let i = 0; i < 9; i++) {
            if (this.grid[i]) {
                if (!colorCount[this.grid[i]]) {
                    colorCount[this.grid[i]] = [];
                }
                colorCount[this.grid[i]].push(i);
            }
        }
        
        // 检查每种颜色是否有至少两个
        for (const color in colorCount) {
            const indices = colorCount[color];
            if (indices.length >= 2) {
                // 移除前两个
                // 先保存马桶颜色
                const toiletColor = color;
                // 同一配对中的马桶动画同时播放
                const animations = [];
                animations.push(this.showMatchUIWithDelay(indices[0], '对子', toiletColor));
                animations.push(this.showMatchUIWithDelay(indices[1], '对子', toiletColor));
                
                // 等待所有动画完成
                await Promise.all(animations);
                
                // 移除所有马桶
                this.grid[indices[0]] = null;
                this.grid[indices[1]] = null;
                
                await this.delay(500 / this.speedMultiplier); // 增加延迟，确保动画完全播放，受倍速控制
            }
        }
        
        return 0; // 不再返回移除的对子数量，因为剩余抽数的增加和加抽的弹窗应当在依次结算配对马桶时才运行
    }
    
    checkMatches() {
        const lines = [
            // 横向
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            // 纵向
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            // 斜向
            [0, 4, 8],
            [2, 4, 6],
            // 连号
            [1, 2, 3],
            [2, 3, 4],
            [3, 4, 5],
            [4, 5, 6],
            [5, 6, 7]
        ];
        
        let matchFound = false;
        
        for (const line of lines) {
            const [a, b, c] = line;
            if (this.grid[a] && this.grid[a] === this.grid[b] && this.grid[b] === this.grid[c]) {
                matchFound = true;
                break;
            }
        }
        
        return matchFound;
    }
    
    resetGame() {
        this.coins = 100;
        this.draws = 0;
        this.grid = Array(9).fill(null);
        // 重置所有奖池的颜色计数
        this.colorCounts = {
            'N': {
                red: 0,
                yellow: 0,
                blue: 0,
                green: 0,
                orange: 0,
                purple: 0,
                black: 0,
                white: 0,
                gray: 0,
                gold: 0,
                rosegold: 0,
                blackgold: 0
            },
            'R': {
                red: 0,
                yellow: 0,
                blue: 0,
                green: 0,
                orange: 0,
                purple: 0,
                black: 0,
                white: 0,
                gray: 0,
                gold: 0,
                rosegold: 0,
                blackgold: 0
            },
            'UR': {
                red: 0,
                yellow: 0,
                blue: 0,
                green: 0,
                orange: 0,
                purple: 0,
                black: 0,
                white: 0,
                gray: 0,
                gold: 0,
                rosegold: 0,
                blackgold: 0
            }
        };
        // 重置超稀有马桶显示
        if (this.superRareToiletElement) {
            this.superRareToiletElement.innerHTML = '<span style="color: #999; font-size: 14px; font-weight: bold;">超稀有马桶</span>';
        }
        this.updateUI();
    }
    
    showNotification(message, element = null) {
        if (element) {
            // 显示小图标在元素上方
            const notification = document.createElement('div');
            notification.style.position = 'absolute';
            notification.style.top = '-30px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
            notification.style.color = 'white';
            notification.style.padding = '5px 10px';
            notification.style.borderRadius = '5px';
            notification.style.fontSize = '14px';
            notification.style.fontWeight = 'bold';
            notification.style.zIndex = '1001';
            notification.style.animation = 'bounce 0.5s ease-in-out';
            notification.textContent = message;
            
            element.style.position = 'relative';
            element.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 1000);
        } else {
            // 保持原有的通知方式
            this.notification.textContent = message;
            this.notification.classList.add('show');
            
            setTimeout(() => {
                this.notification.classList.remove('show');
            }, 1000);
        }
    }
    
    showSuperRareNotification(superRareType) {
        // 如果已经有弹窗打开，直接返回
        if (this.superRareModalOpen) {
            return;
        }
        
        // 设置弹窗状态为打开
        this.superRareModalOpen = true;
        
        // 创建超稀有马桶弹窗
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = 'white';
        modal.style.padding = '30px';
        modal.style.borderRadius = '15px';
        modal.style.boxShadow = '0 0 30px rgba(0,0,0,0.5)';
        modal.style.zIndex = '2000';
        modal.style.textAlign = 'center';
        
        // 使用抽到的马桶素材代替emoji
        const toiletImage = document.createElement('div');
        toiletImage.style.display = 'flex';
        toiletImage.style.justifyContent = 'center';
        toiletImage.style.alignItems = 'center';
        toiletImage.style.animation = 'toiletBounce 1s ease-in-out infinite';
        
        const toiletImg = document.createElement('img');
        const iconPath = this.getToiletIconPath(superRareType);
        toiletImg.src = iconPath;
        toiletImg.style.width = '120px';
        toiletImg.style.height = '120px';
        toiletImage.appendChild(toiletImg);
        
        const title = document.createElement('h2');
        title.textContent = '恭喜！';
        title.style.color = '#ff6b6b';
        title.style.marginTop = '20px';
        
        const message = document.createElement('p');
        message.textContent = '你抽到了超稀有马桶！';
        message.style.fontSize = '18px';
        message.style.color = '#333';
        message.style.marginTop = '10px';
        
        const button = document.createElement('button');
        button.textContent = '确定';
        button.style.marginTop = '20px';
        button.style.padding = '10px 20px';
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '16px';
        
        button.addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.body.removeChild(modal);
            // 设置弹窗状态为关闭
            this.superRareModalOpen = false;
        });
        
        modal.appendChild(toiletImage);
        modal.appendChild(title);
        modal.appendChild(message);
        modal.appendChild(button);
        
        // 添加遮罩
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
        overlay.style.zIndex = '1999';
        
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
    }
    
    showSuperRareToilet() {
        if (this.superRareToiletElement) {
            this.superRareToiletElement.innerHTML = '<div style="font-size: 60px; animation: bounce 2s infinite;">🚽</div>';
        }
    }
    
    showMatchUI(index, type, color) {
        // 获取对应格子的位置
        const cell = this.gridElement.querySelector(`[data-index="${index}"]`);
        if (!cell || !this.removeBox) return;
        
        // 清空格子内容
        cell.textContent = '';
        cell.style.backgroundColor = '';
        cell.style.fontSize = '24px';
        
        // 获取格子和移除框的位置
        const cellRect = cell.getBoundingClientRect();
        const boxRect = this.removeBox.getBoundingClientRect();
        
        // 检查是否是超稀有马桶
        const isSuperRare = color === 'super-rare';
        
        // 创建一个新的马桶标记元素
        const toiletMarker = document.createElement('div');
        toiletMarker.style.position = 'fixed';
        toiletMarker.style.top = `${cellRect.top}px`;
        toiletMarker.style.left = `${cellRect.left}px`;
        toiletMarker.style.width = `${cellRect.width}px`;
        toiletMarker.style.height = `${cellRect.height}px`;
        toiletMarker.style.display = 'flex';
        toiletMarker.style.alignItems = 'center';
        toiletMarker.style.justifyContent = 'center';
        toiletMarker.style.zIndex = '1000';
        toiletMarker.style.transition = 'all 1s ease-in-out';
        
        // 添加马桶图标
        const toiletIcon = document.createElement('img');
        const iconPath = this.getToiletIconPath(color);
        toiletIcon.src = iconPath;
        toiletIcon.style.width = '80%';
        toiletIcon.style.height = '80%';
        toiletMarker.appendChild(toiletIcon);
        
        // 添加马桶标记到body中
        document.body.appendChild(toiletMarker);
        
        // 显示移除原因
        const reasonUI = document.createElement('div');
        reasonUI.style.position = 'fixed';
        reasonUI.style.top = `${cellRect.top}px`;
        reasonUI.style.left = `${cellRect.left + cellRect.width / 2}px`;
        reasonUI.style.transform = 'translate(-50%, -100%)';
        reasonUI.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        reasonUI.style.color = 'white';
        reasonUI.style.padding = '5px 10px';
        reasonUI.style.borderRadius = '5px';
        reasonUI.style.fontSize = '12px';
        reasonUI.style.fontWeight = 'bold';
        reasonUI.style.zIndex = '1001';
        reasonUI.textContent = isSuperRare ? '超稀有马桶' : type;
        document.body.appendChild(reasonUI);
        
        // 计算动画目标位置
        const targetX = boxRect.left + boxRect.width / 2 - cellRect.left;
        const targetY = boxRect.top + boxRect.height / 2 - cellRect.top;
        
        // 触发动画
        setTimeout(() => {
            toiletMarker.style.transform = `translate(${targetX}px, ${targetY}px)`;
            toiletMarker.style.opacity = '0';
            reasonUI.style.opacity = '0';
            
            // 播放背包打开动画
            this.playBackpackAnimation();
        }, 100);
        
        // 1秒后移除
        setTimeout(() => {
            if (toiletMarker.parentNode) {
                toiletMarker.parentNode.removeChild(toiletMarker);
            }
            if (reasonUI.parentNode) {
                reasonUI.parentNode.removeChild(reasonUI);
            }
            // 重置格子内容
            cell.textContent = '';
            cell.style.backgroundColor = '';
            cell.style.fontSize = '24px';
            
            // 更新颜色计数
            this.colorCounts[this.currentPool][color]++;
            
            // 更新UI
            this.updateUI();
            
            // 更新市场中的我的马桶列表
            if (this.marketContainer && window.getComputedStyle(this.marketContainer).display !== 'none') {
                this.updateToiletList();
            }
        }, 1000);
    }
    
    // 播放背包打开动画
    playBackpackAnimation() {
        if (!this.removeBox) return;
        
        const backpackImg = this.removeBox.querySelector('img');
        if (!backpackImg) return;
        
        // 保存原始图片
        const originalSrc = backpackImg.src;
        
        // 动画帧
        const animationFrames = [
            'sprites/backpack_openani1.png',
            'sprites/backpack_openani2.png',
            'sprites/backpack_openani3.png'
        ];
        
        let frameIndex = 0;
        const frameInterval = 100; // 每帧间隔100ms
        
        const animate = () => {
            if (frameIndex < animationFrames.length) {
                backpackImg.src = animationFrames[frameIndex];
                frameIndex++;
                setTimeout(animate, frameInterval);
            } else {
                // 动画结束后恢复原始图片
                backpackImg.src = originalSrc;
            }
        };
        
        animate();
    }
    
    async settleRemainingToilets() {
        let hasMatch = true;
        
        while (hasMatch) {
            hasMatch = false;
            
            // 先检查三连对
            const matchedLines = this.findMatchedLines();
            if (matchedLines.length > 0) {
                hasMatch = true;
                for (const line of matchedLines) {
                    // 为每个匹配的马桶显示动画效果
                    for (const index of line.indices) {
                        const color = this.grid[index];
                        // 只使用showMatchUI，它包含了完整的动画效果
                        await this.showMatchUIWithDelay(index, line.type, color);
                        this.grid[index] = null;
                        await this.delay(500 / this.speedMultiplier); // 增加延迟，确保动画完全播放，受倍速控制
                    }
                }
                continue;
            }
            
            // 再检查对子
            const pairs = this.findPairs();
            if (pairs.length > 0) {
                hasMatch = true;
                for (const pair of pairs) {
                    // 为每个对子显示动画效果
                    for (const index of pair.indices) {
                        const color = this.grid[index];
                        // 只使用showMatchUI，它包含了完整的动画效果
                        await this.showMatchUIWithDelay(index, '对子', color);
                        this.grid[index] = null;
                        await this.delay(500 / this.speedMultiplier); // 增加延迟，确保动画完全播放，受倍速控制
                    }
                }
                continue;
            }
        }
    }
    
    async showMatchUIWithDelay(index, type, color) {
        return new Promise((resolve) => {
            this.showMatchUI(index, type, color);
            // 等待动画完成，受倍速控制
            setTimeout(resolve, 1200 / this.speedMultiplier);
        });
    }
    
    async settleRemainingToiletsWithExtraDraws(targetDraws, extraDraws, completedDraws = 0) {
        let hasMatch = true;
        let totalExtraDraws = 0;
        
        while (hasMatch) {
            hasMatch = false;
            
            // 标记已配对的马桶
            const matchedIndices = new Set();
            
            // 先检查三连对
            const matchedLines = this.findMatchedLines();
            if (matchedLines.length > 0) {
                hasMatch = true;
                for (const line of matchedLines) {
                    // 检查是否有已配对的马桶
                    const hasMatched = line.indices.some(index => matchedIndices.has(index));
                    if (hasMatched) continue;
                    
                    // 标记为已配对
                    line.indices.forEach(index => matchedIndices.add(index));
                    
                    // 同一配对中的马桶动画同时播放
                    const animations = [];
                    for (const index of line.indices) {
                        const color = this.grid[index];
                        animations.push(this.showMatchUIWithDelay(index, line.type, color));
                    }
                    
                    // 等待所有动画完成
                    await Promise.all(animations);
                    
                    // 移除所有马桶
                    for (const index of line.indices) {
                        this.grid[index] = null;
                    }
                    
                    await this.delay(this.baseSettleDelay / this.speedMultiplier); // 增加延迟，确保动画完全播放
                    
                    // 每个三连对增加2抽
                    totalExtraDraws += 2;
                    targetDraws += 2;
                    extraDraws += 2;
                    
                    // 计算剩余抽数
                    const remaining = targetDraws - completedDraws;
                    // 更新剩余抽数显示
                    this.updateUI(remaining);
                    
                    // 显示加抽通知在第一个格子上方
                    const firstCell = this.gridElement.querySelector(`[data-index="${line.indices[0]}"]`);
                    this.showNotification('+2抽', firstCell);
                    this.playCoinSound();
                }
                continue;
            }
            
            // 再检查对子
            const pairs = this.findPairs();
            if (pairs.length > 0) {
                hasMatch = true;
                for (const pair of pairs) {
                    // 检查是否有已配对的马桶
                    const hasMatched = pair.indices.some(index => matchedIndices.has(index));
                    if (hasMatched) continue;
                    
                    // 标记为已配对
                    pair.indices.forEach(index => matchedIndices.add(index));
                    
                    // 同一配对中的马桶动画同时播放
                    const animations = [];
                    for (const index of pair.indices) {
                        const color = this.grid[index];
                        animations.push(this.showMatchUIWithDelay(index, '对子', color));
                    }
                    
                    // 等待所有动画完成
                    await Promise.all(animations);
                    
                    // 移除所有马桶
                    for (const index of pair.indices) {
                        this.grid[index] = null;
                    }
                    
                    await this.delay(this.baseSettleDelay / this.speedMultiplier); // 增加延迟，确保动画完全播放
                    
                    // 每个对子增加1抽
                    totalExtraDraws += 1;
                    targetDraws += 1;
                    extraDraws += 1;
                    
                    // 计算剩余抽数
                    const remaining = targetDraws - completedDraws;
                    // 更新剩余抽数显示
                    this.updateUI(remaining);
                    
                    // 显示加抽通知在第一个格子上方
                    const firstCell = this.gridElement.querySelector(`[data-index="${pair.indices[0]}"]`);
                    this.showNotification('+1抽', firstCell);
                    this.playCoinSound();
                }
                continue;
            }
            
            // 检查是否所有颜色都不同
            const nonNullCells = this.grid.filter(cell => cell !== null);
            const uniqueColors = new Set(nonNullCells);
            if (uniqueColors.size === 9) {
                hasMatch = true;
                // 同一配对中的马桶动画同时播放
                const animations = [];
                for (let i = 0; i < 9; i++) {
                    if (this.grid[i]) {
                        const color = this.grid[i];
                        animations.push(this.showMatchUIWithDelay(i, '九色齐全', color));
                    }
                }
                
                // 等待所有动画完成
                await Promise.all(animations);
                
                // 移除所有马桶
                for (let i = 0; i < 9; i++) {
                    this.grid[i] = null;
                }
                
                await this.delay(this.baseSettleDelay / this.speedMultiplier); // 增加延迟，确保动画完全播放
                
                // 九色齐全增加3抽
                totalExtraDraws += 3;
                targetDraws += 3;
                extraDraws += 3;
                
                // 计算剩余抽数
                const remaining = targetDraws - completedDraws;
                // 更新剩余抽数显示
                this.updateUI(remaining);
                
                // 显示加抽通知在第一个格子上方
                    const firstCell = this.gridElement.querySelector(`[data-index="0"]`);
                    this.showNotification('+3抽', firstCell);
                    this.playCoinSound();
                continue;
            }
        }
        
        return { totalExtraDraws, targetDraws, extraDraws };
    }
    
    findMatchedLines() {
        const lines = [
            // 横向
            { indices: [0, 1, 2], type: '横向三连' },
            { indices: [3, 4, 5], type: '横向三连' },
            { indices: [6, 7, 8], type: '横向三连' },
            // 纵向
            { indices: [0, 3, 6], type: '纵向三连' },
            { indices: [1, 4, 7], type: '纵向三连' },
            { indices: [2, 5, 8], type: '纵向三连' },
            // 斜向
            { indices: [0, 4, 8], type: '斜向三连' },
            { indices: [2, 4, 6], type: '斜向三连' },
            // 连号
            { indices: [1, 2, 3], type: '连号三连' },
            { indices: [2, 3, 4], type: '连号三连' },
            { indices: [3, 4, 5], type: '连号三连' },
            { indices: [4, 5, 6], type: '连号三连' },
            { indices: [5, 6, 7], type: '连号三连' }
        ];
        
        const matchedLines = [];
        
        for (const line of lines) {
            const [a, b, c] = line.indices;
            if (this.grid[a] && this.grid[a] === this.grid[b] && this.grid[b] === this.grid[c]) {
                matchedLines.push(line);
            }
        }
        
        return matchedLines;
    }
    
    findPairs() {
        const colorCount = {};
        for (let i = 0; i < 9; i++) {
            if (this.grid[i]) {
                if (!colorCount[this.grid[i]]) {
                    colorCount[this.grid[i]] = [];
                }
                colorCount[this.grid[i]].push(i);
            }
        }
        
        const pairs = [];
        for (const color in colorCount) {
            const indices = colorCount[color];
            if (indices.length >= 2) {
                pairs.push({ indices: [indices[0], indices[1]], type: '对子' });
            }
        }
        
        return pairs;
    }
    
    async animateToilet(index, type) {
        const cell = this.gridElement.querySelector(`[data-index="${index}"]`);
        if (!cell) return;
        
        // 保存原始样式
        const originalTransform = cell.style.transform;
        
        // 放大震动效果
        cell.style.transition = 'all 0.3s ease-in-out';
        cell.style.transform = 'scale(1.2)';
        
        // 显示移除原因
        const reasonUI = document.createElement('div');
        reasonUI.style.position = 'absolute';
        reasonUI.style.top = '0';
        reasonUI.style.left = '50%';
        reasonUI.style.transform = 'translate(-50%, -100%)';
        reasonUI.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        reasonUI.style.color = 'white';
        reasonUI.style.padding = '5px 10px';
        reasonUI.style.borderRadius = '5px';
        reasonUI.style.fontSize = '12px';
        reasonUI.style.fontWeight = 'bold';
        reasonUI.style.zIndex = '1001';
        reasonUI.textContent = type;
        cell.appendChild(reasonUI);
        
        await this.delay(150);
        cell.style.transform = 'scale(1) rotate(5deg)';
        await this.delay(150);
        cell.style.transform = 'scale(1) rotate(-5deg)';
        await this.delay(150);
        cell.style.transform = originalTransform || '';
        
        // 移除原因UI
        if (reasonUI.parentNode) {
            reasonUI.parentNode.removeChild(reasonUI);
        }
    }
    
    showDrawStats(purchasedDraws, extraDraws, colorStats) {
        // 创建统计弹窗
        const statsModal = document.createElement('div');
        statsModal.style.position = 'fixed';
        statsModal.style.top = '50%';
        statsModal.style.left = '50%';
        statsModal.style.transform = 'translate(-50%, -50%)';
        statsModal.style.backgroundColor = 'white';
        statsModal.style.padding = '20px';
        statsModal.style.borderRadius = '10px';
        statsModal.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
        statsModal.style.zIndex = '1001';
        statsModal.style.width = '400px';
        statsModal.style.maxWidth = '90%';
        
        // 弹窗标题
        const title = document.createElement('h3');
        title.textContent = '抽奖统计';
        title.style.marginBottom = '15px';
        title.style.color = '#333';
        statsModal.appendChild(title);
        
        // 总抽数
        const totalDiv = document.createElement('div');
        totalDiv.style.marginBottom = '10px';
        totalDiv.innerHTML = `总抽数: <span style="color: green; font-weight: bold;">${purchasedDraws} + ${extraDraws} = ${purchasedDraws + extraDraws}发</span>`;
        statsModal.appendChild(totalDiv);
        
        // 颜色统计
        const colorTitle = document.createElement('h4');
        colorTitle.textContent = '此次获得马桶:';
        colorTitle.style.marginBottom = '10px';
        colorTitle.style.fontSize = '14px';
        statsModal.appendChild(colorTitle);
        
        const colorDiv = document.createElement('div');
        colorDiv.style.display = 'grid';
        colorDiv.style.gridTemplateColumns = 'repeat(2, 1fr)';
        colorDiv.style.gap = '10px';
        
        const colorNames = {
            red: '红色',
            yellow: '黄色',
            blue: '蓝色',
            green: '绿色',
            orange: '橙色',
            purple: '紫色',
            black: '黑色',
            white: '白色',
            gray: '灰色',
            gold: '金色',
            rosegold: '玫瑰金',
            blackgold: '黑金'
        };
        
        for (const color in colorStats) {
            if (colorStats[color] > 0) {
                const colorItem = document.createElement('div');
                colorItem.style.display = 'flex';
                colorItem.style.alignItems = 'center';
                colorItem.style.gap = '8px';
                
                // 添加马桶素材图片
                const toiletImage = document.createElement('img');
                const iconPath = this.getToiletIconPath(color);
                toiletImage.src = iconPath;
                toiletImage.style.width = '24px';
                toiletImage.style.height = '24px';
                
                const colorText = document.createElement('span');
                colorText.textContent = `${colorNames[color]}: ${colorStats[color]}个`;
                
                colorItem.appendChild(toiletImage);
                colorItem.appendChild(colorText);
                colorDiv.appendChild(colorItem);
            }
        }
        
        statsModal.appendChild(colorDiv);
        
        // 关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.style.marginTop = '20px';
        closeButton.style.padding = '8px 16px';
        closeButton.style.backgroundColor = '#4CAF50';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.width = '100%';
        
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.body.removeChild(statsModal);
        });
        
        statsModal.appendChild(closeButton);
        
        // 添加遮罩
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '1000';
        
        overlay.addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.body.removeChild(statsModal);
        });
        
        document.body.appendChild(overlay);
        document.body.appendChild(statsModal);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化游戏
new ToiletGame();