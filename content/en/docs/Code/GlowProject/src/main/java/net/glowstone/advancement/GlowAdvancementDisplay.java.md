+++
categories = ["Documentation"]
title = "GlowAdvancementDisplay.java"
+++

## File Summary

- **File Path:** src\main\java\net\glowstone\advancement\GlowAdvancementDisplay.java
- **LOC:** 119
- **Last Modified:** 1 year 0 months
- **Number of Commits (Total / Last 6 Months / Last Month):** 9 / 0 / 0
- **Number of Unique Contributors (Total / Last 6 Months / Last Month):** 6 / 0 / 0
- **Top Contributors:** mastercoms (4), Aram Peres (1), momothereal (1)

{{< details "File source code " >}}
```java
package net.glowstone.advancement;

import com.flowpowered.network.util.ByteBufUtils;
import io.netty.buffer.ByteBuf;
import io.papermc.paper.advancement.AdvancementDisplay;
import lombok.Data;
import net.glowstone.net.GlowBufUtils;
import net.glowstone.util.TextMessage;
import net.kyori.adventure.text.Component;
import org.bukkit.NamespacedKey;
import org.bukkit.inventory.ItemStack;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.io.IOException;
import java.util.Objects;


@Data
public class GlowAdvancementDisplay implements AdvancementDisplay {
    private static final int HAS_BACKGROUND_TEXTURE = 0x1;
    private static final int SHOW_TOAST = 0x2;
    private static final int HIDDEN = 0x4;
    /**
     * The title for this advancement
     */
    private final TextMessage title;
    /**
     * The description for this advancement
     */
    private final TextMessage description;
    /**
     * The icon to represent this advancement
     */
    private final ItemStack icon;
    /**
     * The type of frame for the icon
     */
    private final AdvancementDisplay.Frame type;
    /**
     * The optional directory for the background to use in this advancement tab (used only for the root advancement)
     */
    private final NamespacedKey background;
    /**
     * The x coordinate of the advancement
     */
    private final float x;
    /**
     * The y coordinate of the advancement
     */
    private final float y;

    /**
     * Writes this notification to the given {@link ByteBuf}.
     *
     * @param buf                  the buffer to write to
     * @param hasBackgroundTexture Whether the advancement notification has a background texture
     * @param showToast            Whether or not to show the toast pop up after completing this advancement
     * @param hidden               Whether or not to hide this advancement and all its children from the advancement screen until this advancement have been completed
     * @return {@code buf}, with this notification written to it
     * @throws IOException if a string is too long
     */
    public ByteBuf encode(ByteBuf buf, boolean hasBackgroundTexture, boolean showToast,
                          boolean hidden) throws IOException {
        int flags = (hasBackgroundTexture ? HAS_BACKGROUND_TEXTURE : 0)
            | (showToast ? SHOW_TOAST : 0)
            | (hidden ? HIDDEN : 0);

        GlowBufUtils.writeChat(buf, title);
        GlowBufUtils.writeChat(buf, description);
        GlowBufUtils.writeSlot(buf, icon);
        ByteBufUtils.writeVarInt(buf, type.ordinal());
        buf.writeInt(flags);
        ByteBufUtils.writeUTF8(buf, Objects.toString(background, null));
        buf.writeFloat(x);
        buf.writeFloat(y);
        return buf;
    }

    @Override
    public @NotNull Frame frame() {
        return type;
    }

    @Override
    public @NotNull Component title() {
        return null;
    }

    @Override
    public @NotNull Component description() {
        return null;
    }

    @Override
    public @NotNull ItemStack icon() {
        return icon;
    }

    @Override
    public boolean doesShowToast() {
        return false;
    }

    @Override
    public boolean doesAnnounceToChat() {
        return false;
    }

    @Override
    public boolean isHidden() {
        return false;
    }

    @Override
    public @Nullable NamespacedKey backgroundPath() {
        return background;
    }
}

```
{{< /details >}}



## encode
#### Code Complexity: 11
### Overview
The 'encode' method takes in a byte buffer ('buf'), a byte ('flags'), and a few boolean flags ('hasBackgroundTexture', 'showToast', 'hidden'). The method constructs the flags by bitwise ORing the booleans with their respective flag fields, then several pieces of information - 'title', 'description', 'icon', 'type', 'background', 'x', 'y' - are written into the buffer in sequence. Finally, the method returns the updated buffer.

### User Acceptance Criteria
```gherkin
Feature: Buffer Encoding
 Scenario: Valid Parameters 
 Given the correct parameters are provided 
 When the 'encode' method is called 
 Then the byte buffer should be correctly populated
```

### Refactoring
Refactoring opportunity includes adding null checks for the buffer and the 'Icon' object as these objects are accessed directly which may result in 'NullPointerException'. Furthermore, the method can be refactored to throw a custom, more descriptive exception instead of 'IOException'. It will be helpful in understanding and catching the exception in the code areas where this method is used.{{< details "Function source code " >}}
```java
public ByteBuf encode(ByteBuf buf, boolean hasBackgroundTexture, boolean showToast,
                          boolean hidden) throws IOException {
        int flags = (hasBackgroundTexture ? HAS_BACKGROUND_TEXTURE : 0)
            | (showToast ? SHOW_TOAST : 0)
            | (hidden ? HIDDEN : 0);

        GlowBufUtils.writeChat(buf, title);
        GlowBufUtils.writeChat(buf, description);
        GlowBufUtils.writeSlot(buf, icon);
        ByteBufUtils.writeVarInt(buf, type.ordinal());
        buf.writeInt(flags);
        ByteBufUtils.writeUTF8(buf, Objects.toString(background, null));
        buf.writeFloat(x);
        buf.writeFloat(y);
        return buf;
    }
```
{{< /details >}}

## frame
#### Code Complexity: 1
### Overview
This code represents a method of a class, named 'frame'. This is a public method that returns an instance of the Frame class. The @NotNull tag indicates that this method will never return a null value and will always return an instance of Frame. The 'type' seems to be an attribute of the class where this method is defined and is presumed to be of Frame type.

### User Acceptance Criteria
```gherkin
Feature: Get Frame
 Scenario: Get the Frame from object
 Given an Object is initialized with a Frame instance
 When the 'frame' method is invoked on the object 
 Then it should always return the non-null type of the Frame.
```

### Refactoring
Generally, this code is quite clean, follows the single responsibility principle and doesn't need much refactoring. However, to mitigate the risk of a NullReferenceException, it's best to ensure that the 'type' object is always correctly initialized before a call is made to the 'frame' method. If 'type' object only knows its value during runtime, a null-check could be added to throw a more sensible error.{{< details "Function source code " >}}
```java
@Override
    public @NotNull Frame frame() {
        return type;
    }
```
{{< /details >}}

## title
#### Code Complexity: 1
### Overview
The given method 'title' in the code is a part of an interface/abstract class that returns a Component object. As per the current implementation, it returns null.

### User Acceptance Criteria
```gherkin
Feature: Component Title Method
 Scenario: Call to title method
 Given the system calls the title method
 When the title method is executed
 Then it should return a Component object.
```

### Refactoring
The code can be refactored to include a valid implementation for the title method as it currently returns null. For example, the method can return a new Component() object or a specific Component based on the method requirements. Also, adding null checks can prevent possible NullPointerException scenarios.{{< details "Function source code " >}}
```java
@Override
    public @NotNull Component title() {
        return null;
    }
```
{{< /details >}}

## description
#### Code Complexity: 1
### Overview
This method is an override of the description() method from its parent class/interface. It is a public method that returns a Component object and expects no parameter. In This specific implementation it is returning null, which might cause NullPointerException for the callers expecting a valid Component object from this method.

### Refactoring
The method must be designed to return a valid Component object. If no specific implementation is currently available, the method could return a default Component object or throw a NotImplementedError. It can also be refactored to return an Optional that wraps the Component object. It will require changes in the method signature and the callers of this method where Optional gives better constructs for dealing with missing values.{{< details "Function source code " >}}
```java
@Override
    public @NotNull Component description() {
        return null;
    }
```
{{< /details >}}

## icon
#### Code Complexity: 1
### Overview
The provided code snippet is a public method in a Java interface or class that returns a non-null ItemStack object representing an icon. It's a simple getter method that retrieves the value of the object's ItemStack instance variable named 'icon'.

### User Acceptance Criteria
```gherkin
This particular function is a basic getter method. Generally, such methods do not form a significant part of system behaviour, so they're not commonly included in Gherkin scenarios.
```

### Refactoring
Seeing that this is a very simple piece of code, there isn't much scope for refactoring here. However, to ensure more safety surrounding nulls and prevent external modifications, consider returning a copy of 'icon' instead of its direct reference. Using Optional can also be another way to handle potential null values more gracefully: return Optional.ofNullable(this.icon); to make nullability explicit to the callers.{{< details "Function source code " >}}
```java
@Override
    public @NotNull ItemStack icon() {
        return icon;
    }
```
{{< /details >}}

## doesShowToast
#### Code Complexity: 1
### Overview
The method 'doesShowToast' is a simple boolean method within its class instance. This method returns a static boolean value 'false', stating that a certain condition (like showing a Toast UI component) is never true.

### User Acceptance Criteria
```gherkin
Feature: Boolean Check for Showing Toast UI component
 Scenario: Check if the component shows toast
 Given the class instance is available
 When the method 'doesShowToast' is invoked
 Then the output should always return as false.
```

### Refactoring
Given the static 'false' return, this method could potentially be refactored or removed based on its utility or lack thereof. If a dynamic control over this 'toast showing' capability is expected in the future, a better approach could be to use a variable (maybe a class member) that can be set dynamically, instead of returning a hardcoded value. However, any decision to refactor would greatly depend on the overall architecture and design choices.{{< details "Function source code " >}}
```java
@Override
    public boolean doesShowToast() {
        return false;
    }
```
{{< /details >}}

## doesAnnounceToChat
#### Code Complexity: 1
### Overview
This function is a simple Boolean function which returns false when called. It does not perform any dynamic operations or computations. The function name, 'doesAnnounceToChat', suggests it might be used within the context of a chat application to determine whether certain announcements should be displayed in the chat interface. However, as it is currently implemented, it will always return false.

### User Acceptance Criteria
```gherkin
Feature: Announcement to Chat
 Scenario: Check if the announcement is forwarded to chat
 Given the chat application is on 
 When the doesAnnounceToChat function is invoked 
 Then it should return false
```

### Refactoring
This function could be refactored to receive a variable which determines whether it should return true or false, in order to enhance its usefulness. Alternatively, if the static behavior is indeed intended, but the function is part of a larger class or interface, consider refactoring the class or interface layout to avoid the need for such static functions.{{< details "Function source code " >}}
```java
@Override
    public boolean doesAnnounceToChat() {
        return false;
    }
```
{{< /details >}}

## isHidden
#### Code Complexity: 1
### Overview
This is a simple method named 'isHidden' that belongs to a class implementing the interface that declares this method. It returns a boolean value. In this case, it's hardcoded to always return 'false', meaning the item it represents is not considered hidden within the context of the class's functionality.

### User Acceptance Criteria
```gherkin
Feature: Visibility of Item
 Scenario: Check if the item is hidden
 Given an item in the system
 When the 'isHidden' method is called for it
 Then it should always return false indicating the item is not hidden
```

### Refactoring
If the hidden state of an object is supposed to be dynamic, it's advisable to refactor this method to calculate its return value based on the relevant conditions or state of the object. If it should be static, documenting this feature and its implications thoroughly is recommended so that developers do not have false expectations about its functionality.{{< details "Function source code " >}}
```java
@Override
    public boolean isHidden() {
        return false;
    }
```
{{< /details >}}

## backgroundPath
#### Code Complexity: 1
### Overview
The function `backgroundPath()` is a public method that returns an object of type `NamespacedKey`. The function does not expect any parameter and returns the `background` which is a nullable instance of `NamespacedKey`. This function serves as a getter method for the `background` attribute, providing accessor functionality to it.

### Refactoring
There are no obvious refactoring opportunities identified in this function as it adheres to the single responsibility principle by only getting the `background` attribute. It is relatively clean and adheres to the standards of getter functions.{{< details "Function source code " >}}
```java
@Override
    public @Nullable NamespacedKey backgroundPath() {
        return background;
    }
```
{{< /details >}}

## Risks & Security Issues
**addCriterion**: There might be a risk for other parts of system in the case of unsynchronized access to the method in a multithreaded scenario. If two threads simultaneously try to add the same criterion, it's possible that the criterion could be added twice to the list, which may lead to invalid state of the data.

**addRequirement**: The function does not include any validation checks on the input parameter. Therefore, if a null or an invalid list of criteria is passed, it might cause unexpected behaviour or in worst case scenario, the system might crash.

**getCriteria**: There are minimal security risks with this method since it returns an immutable copy of the list, and not the actual list itself to prevent modification of the original data. However, there's a risk if the 'criteriaIds' list is not properly initialized or is null, as it would lead to a NullPointerException.

**getChildren**: This method right now is a potential risk and is actually violating its contract by returning null where it's supposed to provide a NonNull value. This could potentially lead to a NullPointerException at runtime, crashing the application or disrupting the user experience. The method is also hardcoded to return null, which suggests that its full implementation may not have been completed.

**getRoot**: The getRoot() function claims to never return null by the use of the @NotNull annotation, which contradicts with its current implementation. Since it's always returning null, it might lead to NullPointerException in code parts where result of this method is used without null check. This inconsistency may lead to unexpected runtime errors.

**encode**: There's a potential risk of NullPointerException if getKey() is called on a null parent. There are also no null checks on 'criteriaId' and 'criterion' while writing into 'buf'. This could result in NullPointerException if there are null values in 'criteriaIds' or 'requirements'. There is also no exception handling in the case of IOException.

**getDisplay**: As this is a simple getter method, there are minimal risks involved. However, it's worth noting that the method is designed to return null in case 'display' has not been initialized, which could lead to NullPointerExceptions if not properly handled.

**encode**: There are a couple of risk points here. One, for instance, is that the method does not check if the buffer provided as a parameter is null, which may cause a 'NullPointerException'. Moreover, there's a risk with a non-checked 'IOException' being thrown. Lastly, there is no validation if 'type.ordinal()' is in the index range accepted by 'ByteBufUtils.writeVarInt'. If it exceeds, an 'IndexOutOfBoundsException' may occur.

**frame**: There is not much that can go wrong with the getter methods in general. The major concern here is the potential misuse of @NotNull. If the 'type' object is not properly initialized at all times before the 'frame' method is called, then this could lead to a NullReferenceException at runtime, even though the method is annotated with @NotNull, which misleads developers to think it is safe from null references.

**title**: The method is currently returning a null value which will lead to NullPointerExceptions when methods are invoked on the returned object. There seems to be no validation present for the method which is a potential risk.

**description**: Returning null from this method might lead to NullPointerException in several scenarios if the calling methods are not adequately handling such a case. It is risky to return null especially from a public method.

**icon**: There isn't much opportunity for risk in a simple getter method like this, as it has a straightforward, inert functionality. However, it relies on the caller that the 'icon' field will be properly initialized before it's accessed, otherwise, it could risk throwing a NullPointerException. Furthermore, it doesn't have any protection against possible modification of the returned item stack by the client code.

**doesShowToast**: While there are no evident risks or security issues in the current context of the method, it's worth noting that hardcoding return values like this limits the flexibility and adaptability of the code. Any change in requirement would require a manual code change.

**doesAnnounceToChat**: There do not seem to be any security risks or bugs with this code snippet as it is too basic to pose any direct risks or vulnerabilities. However, the usefulness and correctness of this function is questionable due to its static behavior. If it is indeed used to control whether announcements are made in a chat, the current static implementation would mean announcements are never made.

**isHidden**: As this method's return value is hardcoded, it doesn't reflect any underlying state of the object that could potentially change. If an object's hidden status depends on a certain condition and that is not checked here, it may lead to inappropriate visibility of hidden items. Also, any code that relies on this method to deliver a real 'hidden' state might malfunction.

**backgroundPath**: As the function is very straightforward, there are no apparent risks or bugs. However, as it returns a nullable object, other parts of the software should handle a potential `NULL` value correctly to prevent `NullPointerExceptions` or similar issues.

