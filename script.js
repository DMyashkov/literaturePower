// Configuration
const ENABLE_PAINTING_LANES = false; // Set to false to disable painting lanes

document.addEventListener('DOMContentLoaded', () => {
    const realms = document.querySelectorAll('.realm');
    const container = document.querySelector('.container');

    // Color mapping for each realm
    const realmColors = {
        divine: '#FFD700',
        downfall: '#FF4500',
        control: '#4169E1',
        race: '#FFA500',
        philosophical: '#9370DB'
    };

    // Create main overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '1';
    overlay.style.background = 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)';
    overlay.style.filter = 'blur(40px)';
    document.body.appendChild(overlay);

    // Create expanding circle
    const expandingCircle = document.createElement('div');
    expandingCircle.style.position = 'fixed';
    expandingCircle.style.top = '50%';
    expandingCircle.style.left = '50%';
    expandingCircle.style.transform = 'translate(-50%, -50%)';
    expandingCircle.style.width = '0';
    expandingCircle.style.height = '0';
    expandingCircle.style.borderRadius = '50%';
    expandingCircle.style.opacity = '0';
    expandingCircle.style.pointerEvents = 'none';
    expandingCircle.style.zIndex = '2';
    expandingCircle.style.filter = 'blur(50px)';
    expandingCircle.style.mixBlendMode = 'screen';
    document.body.appendChild(expandingCircle);

    // Create edge lights
    const edgeLights = [];
    const edgePositions = [
        { x: '0%', y: '50%' },    // left
        { x: '100%', y: '50%' },  // right
        { x: '50%', y: '0%' },    // top
        { x: '50%', y: '100%' },  // bottom
        { x: '0%', y: '0%' },     // top-left
        { x: '100%', y: '0%' },   // top-right
        { x: '0%', y: '100%' },   // bottom-left
        { x: '100%', y: '100%' }  // bottom-right
    ];

    edgePositions.forEach(pos => {
        const light = document.createElement('div');
        light.style.position = 'fixed';
        light.style.width = '100vw';
        light.style.height = '100vh';
        light.style.opacity = '0';
        light.style.pointerEvents = 'none';
        light.style.zIndex = '1';
        light.style.background = `radial-gradient(circle at ${pos.x} ${pos.y}, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)`;
        light.style.filter = 'blur(40px)';
        document.body.appendChild(light);
        edgeLights.push(light);
    });

    // Calculate perfect pentagon positions
    const calculatePentagonPositions = () => {
        const containerRect = container.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        const radius = Math.min(containerRect.width, containerRect.height) * 0.35;
        
        const positions = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            positions.push({ x, y });
        }
        
        return positions;
    };

    // Position realms in perfect pentagon
    const positionRealms = () => {
        const positions = calculatePentagonPositions();
        realms.forEach((realm, index) => {
            const pos = positions[index];
            realm.style.left = `${pos.x}px`;
            realm.style.top = `${pos.y}px`;
            realm.style.transform = 'translate(-50%, -50%)';
        });
    };

    positionRealms();
    window.addEventListener('resize', positionRealms);

    let currentAnimation = null;
    let isExpanded = false;

    const resetAllEffects = () => {
        if (currentAnimation) {
            cancelAnimationFrame(currentAnimation);
            currentAnimation = null;
        }
        isExpanded = false;
        
        // Hide escape text
        document.querySelector('.escape-text').classList.remove('visible');
        
        // Hide all timelines with smooth transition
        const timelineContainers = document.querySelectorAll('.timeline-container');
        
        // Remove visible class first to trigger fade out
        timelineContainers.forEach(container => {
            container.classList.remove('visible');
        });
        
        // Wait for fade out animation to complete before hiding
        setTimeout(() => {
            timelineContainers.forEach(container => {
                container.style.display = 'none';
            });
        }, 500); // Match the transition duration
        
        // Hide painting lanes
        document.querySelector('.painting-lanes').classList.remove('visible');
        
        // Remove active state from timeline points
        document.querySelectorAll('.timeline-point').forEach(p => p.classList.remove('active'));
        
        // Reset all text transforms
        realms.forEach(realm => {
            const subtext = realm.querySelector('h2');
            if (subtext) {
                subtext.style.transform = 'scale(1)';
            }
        });

        // Reset central text position using CSS transition
        const centralText = document.querySelector('.central-text');
        centralText.classList.remove('moved');
        
        // Animate back to normal state
        const startTime = Date.now();
        const startOpacity = parseFloat(overlay.style.opacity) || 0;
        const startCircleOpacity = parseFloat(expandingCircle.style.opacity) || 0;
        const startCircleSize = parseFloat(expandingCircle.style.width) || 0;
        
        const circleResetAnimation = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / 500, 1); // 500ms reset animation
            const eased = 1 - Math.pow(1 - progress, 2);
            
            overlay.style.opacity = startOpacity * (1 - eased);
            expandingCircle.style.opacity = startCircleOpacity * (1 - eased);
            expandingCircle.style.width = `${startCircleSize * (1 - eased)}px`;
            expandingCircle.style.height = `${startCircleSize * (1 - eased)}px`;
            
            if (progress < 1) {
                currentAnimation = requestAnimationFrame(circleResetAnimation);
            } else {
                overlay.style.opacity = '0';
                expandingCircle.style.width = '0';
                expandingCircle.style.height = '0';
                expandingCircle.style.opacity = '0';
                realms.forEach(r => {
                    r.style.opacity = '1';
                });
            }
        };
        
        circleResetAnimation();
    };

    // Add escape key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isExpanded) {
            resetAllEffects();
        }
    });

    // Add emoji mapping for each theme
    const themeEmojis = {
        'divine': ['👑', '✨', '⚜️', '🌟', '🏛️'], // Divine and Fateful Power
        'race': ['👨', '👩', '👨🏿', '👩🏿', '🌍'], // Power of Whites over Blacks
        'downfall': ['😔', '💔', '🌑', '🌪️', '⚡'], // Power as Personal Downfall
        'philosophical': ['🔮', '💭', '📜', '⚖️', '🎭'], // Philosophical and Utopian Visions
        'control': ['👁️', '🔍', '📜', '🎭', '⚖️']  // Power as Social and Absolute Control
    };

    function createEmojiRain(realmType) {
        const emojis = themeEmojis[realmType] || ['✨'];
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '1000';
        document.body.appendChild(container);

        const emojiCount = 50; // Number of emojis to create
        const duration = 3000; // Duration of the rain effect in ms

        for (let i = 0; i < emojiCount; i++) {
            const emoji = document.createElement('div');
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.position = 'absolute';
            emoji.style.fontSize = `${Math.random() * 20 + 20}px`; // Random size between 20-40px
            emoji.style.left = `${Math.random() * 100}%`;
            emoji.style.top = '-50px';
            emoji.style.opacity = '0';
            emoji.style.transform = 'translateY(0)';
            emoji.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            container.appendChild(emoji);

            // Trigger animation after a small delay
            setTimeout(() => {
                emoji.style.opacity = '0.8';
                emoji.style.transform = `translateY(${window.innerHeight + 100}px)`;
            }, Math.random() * 500); // Stagger the start of each emoji
        }

        // Remove the container after animation completes
        setTimeout(() => {
            container.remove();
        }, duration + 500);
    }

    // Create hover effects for each realm
    realms.forEach(realm => {
        const realmType = realm.getAttribute('data-realm');
        const realmContent = realm.querySelector('.realm-content');
        
        const hoverEffect = document.createElement('div');
        hoverEffect.className = 'hover-effect';
        hoverEffect.style.background = `radial-gradient(circle, ${realmColors[realmType]}80 0%, ${realmColors[realmType]}00 70%)`;
        realm.appendChild(hoverEffect);

        const updateHoverEffectPosition = () => {
            const rect = realm.getBoundingClientRect();
            hoverEffect.style.left = `${rect.width/2 - 300}px`;
            hoverEffect.style.top = `${rect.height/2 - 300}px`;
        };
        updateHoverEffectPosition();
        window.addEventListener('resize', updateHoverEffectPosition);

        const startExpansion = () => {
            if (isExpanded) return;
            isExpanded = true;
            
            const realmType = realm.getAttribute('data-realm');
            createEmojiRain(realmType);
            
            // Show escape text
            document.querySelector('.escape-text').classList.add('visible');
            
            // Show timeline if philosophical
            const timelineContainer = document.querySelector('.timeline-container');
            const paintingLanes = document.querySelector('.painting-lanes');
            
            if (realmType === 'philosophical' || realmType === 'downfall' || 
                realmType === 'control' || realmType === 'divine' || realmType === 'race') {
                timelineContainer.style.display = 'flex';
                // Wait for the power to top animation to reach 15%
                const checkPowerPosition = () => {
                    const centralText = document.querySelector('.central-text');
                    const transform = getComputedStyle(centralText).transform;
                    const matrix = new DOMMatrix(transform);
                    const translateY = matrix.m42;
                    const progress = Math.abs(translateY) / (window.innerHeight * 0.4); // 40vh is the total movement
                    
                    if (progress >= 0.15) {
                        // Show the appropriate timeline
                        const philosophicalTimeline = document.getElementById('philosophical-timeline');
                        const downfallTimeline = document.getElementById('downfall-timeline');
                        const controlTimeline = document.getElementById('control-timeline');
                        const divineTimeline = document.getElementById('divine-timeline');
                        const raceTimeline = document.getElementById('race-timeline');
                        
                        // Hide all timelines first
                        philosophicalTimeline.parentElement.style.display = 'none';
                        downfallTimeline.parentElement.style.display = 'none';
                        controlTimeline.parentElement.style.display = 'none';
                        divineTimeline.parentElement.style.display = 'none';
                        raceTimeline.parentElement.style.display = 'none';
                        
                        // Show the appropriate timeline with the same animation
                        const targetTimeline = {
                            'philosophical': philosophicalTimeline,
                            'downfall': downfallTimeline,
                            'control': controlTimeline,
                            'divine': divineTimeline,
                            'race': raceTimeline
                        }[realmType];
                        
                        if (targetTimeline) {
                            targetTimeline.parentElement.style.display = 'flex';
                            // Force reflow to ensure transition works
                            targetTimeline.parentElement.offsetHeight;
                            targetTimeline.parentElement.classList.add('visible');
                        }
                        
                        if (ENABLE_PAINTING_LANES) {
                            paintingLanes.classList.add('visible');
                        }
                    } else {
                        requestAnimationFrame(checkPowerPosition);
                    }
                };
                checkPowerPosition();
            } else {
                timelineContainer.style.display = 'none';
                timelineContainer.classList.remove('visible');
                paintingLanes.classList.remove('visible');
            }
            
            // Set the base color
            overlay.style.background = realmColors[realmType];
            expandingCircle.style.background = realmColors[realmType];
            
            // Start the expansion animation
            let scale = 0;
            const expansionStartTime = Date.now();
            const expansionDuration = 8000;
            
            const expansionAnimate = () => {
                const elapsed = Date.now() - expansionStartTime;
                const progress = Math.min(elapsed / expansionDuration, 1);
                
                // Simple ease out
                const eased = 1 - Math.pow(1 - progress, 2);
                
                // Update expanding circle
                const maxSize = Math.max(window.innerWidth, window.innerHeight) * 1.5;
                const currentSize = maxSize * eased;
                expandingCircle.style.width = `${currentSize}px`;
                expandingCircle.style.height = `${currentSize}px`;
                expandingCircle.style.opacity = 0.15 + (eased * 0.25);
                
                // Update overlay with smoother transition
                overlay.style.opacity = 0.05 + (eased * 0.2);

                // Move central text to top when circle reaches 15%
                const centralText = document.querySelector('.central-text');
                if (progress >= 0.15) {
                    centralText.classList.add('moved');
                }
                
                if (progress < 1 && isExpanded) {
                    currentAnimation = requestAnimationFrame(expansionAnimate);
                }
            };
            
            expansionAnimate();
            
            // Hide other elements
            realms.forEach(r => {
                if (r !== realm) {
                    r.style.opacity = '0';
                }
            });
            realmContent.style.opacity = '1';
            hoverEffect.style.opacity = '0';
        };

        realm.addEventListener('click', startExpansion);
    });

    // Add mousemove effect to container
    container.addEventListener('mousemove', (e) => {
        if (isExpanded) return; // Skip hover effects when expanded

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        realms.forEach(realm => {
            const realmRect = realm.getBoundingClientRect();
            const realmCenterX = realmRect.left + realmRect.width/2 - rect.left;
            const realmCenterY = realmRect.top + realmRect.height/2 - rect.top;
            
            const distance = Math.sqrt(
                Math.pow(mouseX - realmCenterX, 2) + 
                Math.pow(mouseY - realmCenterY, 2)
            );
            
            const maxDistance = 1000;
            // Create a more pronounced gradient using quadratic easing
            const rawIntensity = Math.max(0, 1 - (distance / maxDistance));
            const intensity = Math.pow(rawIntensity, 2); // Square the intensity for more dramatic falloff
            
            const realmContent = realm.querySelector('.realm-content');
            realmContent.style.opacity = 0.3 + (intensity * 0.7);
            
            const hoverEffect = realm.querySelector('.hover-effect');
            hoverEffect.style.opacity = intensity * 2; // Increased multiplier for more dramatic effect
        });
    });

    // Reset effects when mouse leaves container
    container.addEventListener('mouseleave', () => {
        if (isExpanded) return; // Skip reset when expanded

        realms.forEach(realm => {
            const realmContent = realm.querySelector('.realm-content');
            const hoverEffect = realm.querySelector('.hover-effect');
            realmContent.style.opacity = 0.3;
            hoverEffect.style.opacity = 0;
        });
    });

    // Add click handler for central text
    document.querySelector('.central-text').addEventListener('click', () => {
        const realmsContainer = document.querySelector('.realms-container');
        
        // Prevent if already spinning
        if (realmsContainer.classList.contains('spinning')) {
            return;
        }
        
        const realms = Array.from(document.querySelectorAll('.realm'));
        
        // Remove any existing animation
        realmsContainer.style.animation = 'none';
        realmsContainer.offsetHeight; // Force reflow
        
        // Add spinning class
        realmsContainer.classList.add('spinning');
        realmsContainer.style.animation = 'spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        
        // Shuffle the realms
        for (let i = realms.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            realms[i].style.order = j;
            realms[j].style.order = i;
        }
        
        // Remove spinning class after animation completes
        setTimeout(() => {
            realmsContainer.classList.remove('spinning');
            realmsContainer.style.animation = '';
        }, 1500);
    });

    // Add click handler for escape text
    document.querySelector('.escape-text').addEventListener('click', () => {
        if (isExpanded) {
            resetAllEffects();
        }
    });

    // Timeline book click handlers
    const timelinePoints = document.querySelectorAll('.timeline-point');
    let lastActiveBook = null;

    timelinePoints.forEach(point => {
        point.addEventListener('click', () => {
            const book = point.getAttribute('data-book');
            if (lastActiveBook === book) {
                point.classList.remove('active');
                lastActiveBook = null;
            } else {
                // Remove active from all
                timelinePoints.forEach(p => p.classList.remove('active'));
                // Add active to this
                point.classList.add('active');
                lastActiveBook = book;
            }
        });
    });

    const timeline = document.querySelector('.timeline');
    const paintingLanes = document.querySelector('.painting-lanes');
    let isTimelineVisible = false;

    // Add click handlers for book titles
    const bookTitles = document.querySelectorAll('.book-title');
    bookTitles.forEach(title => {
        title.addEventListener('click', () => {
            // Get the book title from the data attribute
            const bookTitle = title.closest('.timeline-point').getAttribute('data-book');
            // Map the data attribute to the actual book title
            const titleMap = {
                'utopia': 'Утопия',
                'city-of-sun': 'Градът на слънцето',
                'social-contract': 'Обществения договор',
                'macbeth': 'Макбет',
                'faust': 'Фауст',
                'tobacco': 'Тютюн',
                '1984': '1984',
                'handmaid': 'Разказът на прислужницата',
                'flies': 'Повелителят на мухите',
                'antigone': 'Антигона',
                'job': 'Книга на Йов',
                'odyssey': 'Одисея',
                'mockingbird': 'Да убиеш присмехулник',
                'promised': 'Обетована земя',
                'beloved': 'Beloved'
            };
            const actualTitle = titleMap[bookTitle];
            
            if (actualTitle) {
                // Add fade-out effect to the current page
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.5s ease-out';
                
                // Navigate to the book page after the fade-out
                setTimeout(() => {
                    window.location.href = `choice.html?title=${encodeURIComponent(actualTitle)}`;
                }, 500);
            }
        });
    });

    // Initialize painting lanes visibility based on config
    if (!ENABLE_PAINTING_LANES) {
        paintingLanes.style.display = 'none';
    }

    // Show timeline and painting lanes when clicking the button
    document.querySelector('.show-timeline').addEventListener('click', () => {
        isTimelineVisible = true;
        const selectedRealm = document.querySelector('.realm.active');
        if (selectedRealm) {
            const realmType = selectedRealm.getAttribute('data-realm');
            const philosophicalTimeline = document.getElementById('philosophical-timeline');
            const downfallTimeline = document.getElementById('downfall-timeline');
            
            // Hide all timelines first
            philosophicalTimeline.parentElement.style.display = 'none';
            downfallTimeline.parentElement.style.display = 'none';
            
            // Show the appropriate timeline
            if (realmType === 'philosophical') {
                philosophicalTimeline.parentElement.style.display = 'block';
                philosophicalTimeline.parentElement.classList.add('visible');
            } else if (realmType === 'downfall') {
                downfallTimeline.parentElement.style.display = 'block';
                downfallTimeline.parentElement.classList.add('visible');
            }
        }
        
        if (ENABLE_PAINTING_LANES) {
            paintingLanes.style.display = 'block';
            paintingLanes.classList.add('visible');
        }
    });

    // Hide timeline and painting lanes when clicking outside
    document.addEventListener('click', (e) => {
        if (isTimelineVisible && !e.target.closest('.timeline') && !e.target.classList.contains('show-timeline')) {
            isTimelineVisible = false;
            document.querySelectorAll('.timeline-container').forEach(container => {
                container.classList.remove('visible');
            });
            if (ENABLE_PAINTING_LANES) {
                paintingLanes.classList.remove('visible');
                setTimeout(() => {
                    paintingLanes.style.display = 'none';
                }, 500); // Match transition duration
            }
        }
    });

    // Hide timeline and painting lanes when pressing escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isTimelineVisible) {
            isTimelineVisible = false;
            document.querySelectorAll('.timeline-container').forEach(container => {
                container.classList.remove('visible');
            });
            if (ENABLE_PAINTING_LANES) {
                paintingLanes.classList.remove('visible');
                setTimeout(() => {
                    paintingLanes.style.display = 'none';
                }, 500); // Match transition duration
            }
        }
    });
}); 